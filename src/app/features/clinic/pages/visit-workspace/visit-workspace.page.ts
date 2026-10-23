import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { debounceTime, firstValueFrom, merge } from 'rxjs';
import { AppointmentActionsBar } from '../../components/appointment-actions/appointment-actions.component';
import { ConsentsPanel } from '../../components/consents-panel/consents-panel.component';
import { Icd10Picker } from '../../components/icd10-picker/icd10-picker.component';
import { ProgressMeter } from '@shared/components/progress-meter/progress-meter.component';
import { ConsentDialogData } from '../../interfaces/dialog-data.interface';
import { AppointmentActions } from '../../services/appointment-actions.service';
import { ClinicalActions } from '../../services/clinical-actions.service';
import { bmi } from '../../utils/clinical';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { AppointmentStatus } from '@shared/enums/clinic/appointment-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Appointment } from '@shared/interfaces/clinic/appointment.interface';
import { ClinicalOrder } from '@shared/interfaces/clinic/clinical-order.interface';
import {
  Icd10Code,
  MedicalRecord,
  MedicalRecordPayload,
  RecordDiagnosis,
  Vitals,
} from '@shared/interfaces/clinic/medical-record.interface';
import { Patient } from '@shared/interfaces/clinic/patient.interface';
import { Treatment } from '@shared/interfaces/clinic/treatment.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { ApiClient } from '@shared/services/api/api-client.service';
import { AccessService } from '@shared/services/auth/access.service';
import { AuthStore } from '@shared/services/auth/auth.store';
import { AppointmentApi } from '@shared/services/clinic/appointment-api.service';
import { MedicalRecordApi } from '@shared/services/clinic/medical-record-api.service';
import { PatientApi } from '@shared/services/clinic/patient-api.service';
import { TreatmentApi } from '@shared/services/clinic/treatment-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/** Pause after typing before the note is saved. */
const AUTOSAVE_MS = 1200;

/** Visit statuses in which the note can be written (vitals from check-in). */
const DOCUMENTABLE: readonly AppointmentStatus[] = [
  AppointmentStatus.CheckedIn,
  AppointmentStatus.InProgress,
  AppointmentStatus.Completed,
];

const VITAL_KEYS = [
  'temperatureC',
  'pulseBpm',
  'systolicBp',
  'diastolicBp',
  'respiratoryRate',
  'spo2Percent',
  'weightKg',
  'heightCm',
] as const;
type VitalKey = (typeof VITAL_KEYS)[number];

/**
 * `/clinic/appointments/:id/visit` — the clinician's screen during a visit: SOAP notes and vitals (saved as you
 * type), ICD-10 diagnoses, orders, treatment plans and consents; the provider signs (and completes) the visit,
 * after which corrections are addenda.
 */
@Component({
  selector: 'app-visit-workspace-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    StatusChip,
    TextField,
    AppointmentActionsBar,
    ConsentsPanel,
    Icd10Picker,
    ProgressMeter,
    EnumLabelPipe,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatTabsModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './visit-workspace.page.html',
})
export class VisitWorkspacePage implements OnInit {
  readonly id = input.required<string>();

  private readonly appointments = inject(AppointmentApi);
  private readonly patients = inject(PatientApi);
  private readonly records = inject(MedicalRecordApi);
  private readonly treatments = inject(TreatmentApi);
  private readonly client = inject(ApiClient);
  private readonly clinical = inject(ClinicalActions);
  private readonly visitActions = inject(AppointmentActions);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly me = inject(AuthStore).user()?.id;
  private readonly canWrite = inject(AccessService).can('records.write');
  protected readonly canReadNotes = inject(AccessService).can('patients.view_medical');

  protected readonly appointment = signal<Appointment | null>(null);
  protected readonly patient = signal<Patient | null>(null);
  protected readonly record = signal<MedicalRecord | null>(null);
  protected readonly diagnoses = signal<RecordDiagnosis[]>([]);
  protected readonly orders = signal<ClinicalOrder[]>([]);
  protected readonly plans = signal<Treatment[]>([]);
  protected readonly error = signal<unknown>(null);
  protected readonly saveState = signal<SaveState>('idle');
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;

  protected readonly notes = new FormGroup({
    chiefComplaint: new FormControl<string | null>(null, [Validators.maxLength(5000)]),
    history: new FormControl<string | null>(null, [Validators.maxLength(10000)]),
    examination: new FormControl<string | null>(null, [Validators.maxLength(10000)]),
    assessment: new FormControl<string | null>(null, [Validators.maxLength(10000)]),
    plan: new FormControl<string | null>(null, [Validators.maxLength(10000)]),
  });
  protected readonly vitals = new FormGroup(
    Object.fromEntries(VITAL_KEYS.map((k) => [k, new FormControl<number | null>(null)])) as Record<
      VitalKey,
      FormControl<number | null>
    >,
  );
  private readonly vitalValues = signal<Partial<Vitals>>({});
  protected readonly bmi = computed(() =>
    bmi(this.vitalValues().weightKg, this.vitalValues().heightCm),
  );

  protected readonly editable = computed(() => {
    const a = this.appointment();
    const r = this.record();
    return this.canWrite && !!a && !!r && !r.isSigned && DOCUMENTABLE.includes(a.status);
  });
  protected readonly isProvider = computed(() => this.appointment()?.providerId === this.me);
  protected readonly canSign = computed(() => {
    const a = this.appointment();
    return (
      this.editable() &&
      this.isProvider() &&
      (a?.status === AppointmentStatus.InProgress || a?.status === AppointmentStatus.Completed)
    );
  });
  protected readonly consentContext = computed<ConsentDialogData | null>(() => {
    const p = this.patient();
    const a = this.appointment();
    return p && a ? { patient: p, appointmentId: a.id, treatmentId: a.treatmentId } : null;
  });

  private saving: Promise<void> = Promise.resolve();
  private diagnosesDirty = false;

  ngOnInit(): void {
    merge(this.notes.valueChanges, this.vitals.valueChanges)
      .pipe(debounceTime(AUTOSAVE_MS), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.save());
    this.vitals.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.vitalValues.set(v));
    void this.load();
  }

  protected async load(): Promise<void> {
    this.error.set(null);
    try {
      const appointment = await firstValueFrom(this.appointments.get(this.id()));
      this.appointment.set(appointment);
      const [patient, record] = await Promise.all([
        firstValueFrom(this.patients.get(appointment.patientId)),
        firstValueFrom(this.records.get(appointment.id)),
      ]);
      this.patient.set(patient);
      this.applyRecord(record);
      await Promise.all([this.loadOrders(), this.loadPlans()]);
    } catch (error) {
      this.error.set(error);
    }
  }

  /** Saves what changed (queued behind a running save). */
  protected save(): Promise<void> {
    this.saving = this.saving.then(() => this.flush());
    return this.saving;
  }

  protected addDiagnosis(code: Icd10Code): void {
    if (this.diagnoses().some((d) => d.icd10CodeId === code.id)) return;
    const first = this.diagnoses().length === 0;
    this.diagnoses.update((list) => [
      ...list,
      {
        icd10CodeId: code.id,
        code: code.code,
        title: code.title,
        titleAr: code.titleAr,
        isPrimary: first,
        notes: null,
      },
    ]);
    this.diagnosesChanged();
  }

  protected removeDiagnosis(diagnosis: RecordDiagnosis): void {
    const rest = this.diagnoses().filter((d) => d !== diagnosis);
    if (diagnosis.isPrimary && rest.length) rest[0] = { ...rest[0], isPrimary: true };
    this.diagnoses.set(rest);
    this.diagnosesChanged();
  }

  protected makePrimary(diagnosis: RecordDiagnosis): void {
    this.diagnoses.update((list) => list.map((d) => ({ ...d, isPrimary: d === diagnosis })));
    this.diagnosesChanged();
  }

  protected readonly sign = async (): Promise<void> => {
    await this.save();
    this.applyRecord(await firstValueFrom(this.records.sign(this.id())));
    this.saveState.set('idle');
    this.notify.success('Visit note signed — it is now read-only.');
  };

  /** Sign, then complete the visit (the complete dialog offers a follow-up). */
  protected readonly signAndComplete = async (): Promise<void> => {
    await this.sign();
    const complete = this.visitActions
      .for(this.appointment() as Appointment)
      .find((a) => a.key === 'complete');
    const done = await complete?.run();
    if (done) this.appointment.set(done);
  };

  protected readonly addAddendum = async (): Promise<void> => {
    const text = await this.dialogs.reason({
      title: 'Add an addendum',
      message: 'Dated and signed with your name; the original note stays as it was.',
      reasonLabel: 'Addendum',
      confirmLabel: 'Add',
    });
    if (!text) return;
    this.applyRecord(await firstValueFrom(this.records.addAddendum(this.id(), text)));
    this.notify.success('Addendum added.');
  };

  protected readonly newOrder = async (): Promise<void> => {
    const a = this.appointment();
    const p = this.patient();
    if (
      a &&
      p &&
      (await this.clinical.order({ patient: p, appointmentId: a.id, treatmentId: a.treatmentId }))
    )
      await this.loadOrders();
  };

  protected readonly prescribe = async (): Promise<void> => {
    const a = this.appointment();
    if (
      a &&
      (await this.clinical.prescribe({
        patient: this.patient(),
        appointmentId: a.id,
        doctorId: this.isProvider() ? this.me : null,
      }))
    )
      await this.loadPlans();
  };

  protected visitChanged(updated: Appointment): void {
    this.appointment.set(updated);
    this.syncEditable();
  }

  private async flush(): Promise<void> {
    const record = this.record();
    if (!record || !this.editable()) return;
    const payload: MedicalRecordPayload = { version: record.version };
    for (const [key, control] of Object.entries(this.notes.controls)) {
      if (control.dirty) (payload as Record<string, unknown>)[key] = control.value?.trim() || null;
    }
    if (this.vitals.dirty) payload.vitals = this.vitals.getRawValue();
    if (this.diagnosesDirty)
      payload.diagnoses = this.diagnoses().map((d) => ({
        icd10CodeId: d.icd10CodeId,
        isPrimary: d.isPrimary,
        notes: d.notes,
      }));
    if (Object.keys(payload).length === 1) return;

    this.notes.markAsPristine();
    this.vitals.markAsPristine();
    this.diagnosesDirty = false;
    this.saveState.set('saving');
    try {
      const saved = await firstValueFrom(this.records.save(this.id(), payload));
      this.record.set(saved);
      this.saveState.set('saved');
    } catch (error) {
      this.saveState.set('error');
      throw error;
    }
  }

  private diagnosesChanged(): void {
    this.diagnosesDirty = true;
    void this.save();
  }

  private applyRecord(record: MedicalRecord): void {
    this.record.set(record);
    this.notes.patchValue(
      {
        chiefComplaint: record.chiefComplaint ?? null,
        history: record.history ?? null,
        examination: record.examination ?? null,
        assessment: record.assessment ?? null,
        plan: record.plan ?? null,
      },
      { emitEvent: false },
    );
    const vitals = Object.fromEntries(
      VITAL_KEYS.map((k) => [k, record.vitals[k] ?? null]),
    ) as Record<VitalKey, number | null>;
    this.vitals.patchValue(vitals, { emitEvent: false });
    this.vitalValues.set(vitals);
    this.diagnoses.set(record.diagnoses ?? []);
    this.syncEditable();
  }

  private syncEditable(): void {
    for (const form of [this.notes, this.vitals]) {
      if (this.editable()) form.enable({ emitEvent: false });
      else form.disable({ emitEvent: false });
    }
  }

  private async loadOrders(): Promise<void> {
    const page = await firstValueFrom(
      this.client.list<ClinicalOrder>('clinical-orders', {
        perPage: 50,
        sort: ['-createdAt'],
        filter: { and: [{ appointmentId: { eq: this.id() } }] },
      }),
    ).catch(() => ({ data: [] as ClinicalOrder[] }));
    this.orders.set(page.data);
  }

  private async loadPlans(): Promise<void> {
    const a = this.appointment();
    if (!a) return;
    const page = await firstValueFrom(
      this.treatments.list({
        perPage: 20,
        sort: ['-createdAt'],
        filter: {
          and: [{ patientId: { eq: a.patientId } }, { status: { in: ['pending', 'in_progress'] } }],
        },
      }),
    ).catch(() => ({ data: [] as Treatment[] }));
    this.plans.set(page.data);
  }
}

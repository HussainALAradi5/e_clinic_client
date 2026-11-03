import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppointmentRows } from '@components/clinic/appointment-rows/appointment-rows.component';
import { PatientBilling } from '@components/billing/patient-billing/patient-billing.component';
import { PatientMedicines } from '@components/pharmacy/patient-medicines/patient-medicines.component';
import { ConsentsPanel } from '@components/clinic/consents-panel/consents-panel.component';
import { PatientCare } from '@components/clinic/patient-care/patient-care.component';
import { MedicalHistoryDialog } from '@components/clinic/medical-history-dialog/medical-history-dialog.component';
import { PatientFormDialog } from '@components/clinic/patient-form-dialog/patient-form-dialog.component';
import { PatientFormDialogData } from '@interfaces/clinic/dialog-data.interface';
import { HasAccessDirective } from '@directives/has-access.directive';
import { PersonFormDialog } from '@components/system/users/person-form-dialog/person-form-dialog.component';
import { PersonFormDialogData } from '@interfaces/system/users/person-form-dialog-data.interface';
import { AppointmentActions } from '@services/clinic/appointment-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_TIME_FORMAT } from '@constants/app.constants';
import { ButtonVariant } from '@enums/ui/button.enum';
import { ApiError } from '@interfaces/api/api-error.interface';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { Patient } from '@interfaces/clinic/patient.interface';
import { PatientTimelineEntry } from '@interfaces/clinic/patient-timeline-entry.interface';
import { ConfirmConfig } from '@interfaces/ui/confirm-config.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { ApiClient } from '@services/api/api-client.service';
import { PatientApi } from '@services/clinic/patient-api.service';
import { EnumService } from '@services/data/enum.service';
import { UserApi } from '@services/identity/user-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { PATIENT_DETAIL_TEXT } from '@constants/clinic/patient-detail.constants';
import { emergencyContactLine } from '@utilities/clinic/emergency-contacts-form';

/** `/clinic/patients/:id` — the patient file: alerts, personal and insurance data, visits, timeline, history. */
@Component({
  selector: 'app-patient-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    AuditHistory,
    AppointmentRows,
    PatientCare,
    ConsentsPanel,
    PatientBilling,
    PatientMedicines,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    HasAccessDirective,
    DatePipe,
  ],
  templateUrl: './patient-detail.page.html',
})
export class PatientDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(PatientApi);
  private readonly users = inject(UserApi);
  private readonly client = inject(ApiClient);
  private readonly dialogs = inject(DialogService);
  private readonly bookings = inject(AppointmentActions);
  private readonly notify = inject(NotifyService);
  private readonly enums = inject(EnumService);

  protected readonly patient = signal<Patient | null>(null);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly upcoming = signal<Appointment[]>([]);
  protected readonly past = signal<Appointment[]>([]);
  protected readonly timeline = signal<PatientTimelineEntry[] | null>(null);
  protected readonly variants = ButtonVariant;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly portalConfirm: ConfirmConfig = {
    title: PATIENT_DETAIL_TEXT.createAPortalAccount,
    message: PATIENT_DETAIL_TEXT.thePatientReceivesAnEmail,
    confirmLabel: PATIENT_DETAIL_TEXT.createAccount,
  };

  protected readonly personal = computed<Fact[]>(() => {
    const p = this.patient();
    if (!p) return [];
    return [
      { label: PATIENT_DETAIL_TEXT.fileNumber, value: p.code, mono: true },
      { label: PATIENT_DETAIL_TEXT.gender, value: p.gender, enum: PATIENT_DETAIL_TEXT.gender },
      { label: PATIENT_DETAIL_TEXT.dateOfBirth, value: `${p.dateOfBirth} (${p.age} y)` },
      { label: PATIENT_DETAIL_TEXT.nationalId, value: p.person.nationalId, mono: true },
      {
        label: PATIENT_DETAIL_TEXT.nationality,
        value: p.person.nationality?.nationality,
        flag: p.person.nationalityCode,
      },
      { label: PATIENT_DETAIL_TEXT.mobile, value: p.phone },
      { label: PATIENT_DETAIL_TEXT.email, value: p.email },
      { label: PATIENT_DETAIL_TEXT.address, value: p.person.address?.formatted },
    ];
  });

  protected readonly file = computed<Fact[]>(() => {
    const p = this.patient();
    if (!p) return [];
    return [
      ...(p.bloodGroup
        ? [
            {
              label: PATIENT_DETAIL_TEXT.bloodGroup,
              value: this.enums.label('BloodGroup', p.bloodGroup),
            },
          ]
        : []),
      ...(p.bloodGroup !== undefined
        ? [
            { label: PATIENT_DETAIL_TEXT.chronicConditions, value: p.chronicConditions },
            { label: PATIENT_DETAIL_TEXT.familyHistory, value: p.familyHistory },
            { label: PATIENT_DETAIL_TEXT.surgicalHistory, value: p.surgicalHistory },
          ]
        : []),
      {
        label: PATIENT_DETAIL_TEXT.emergencyContact,
        value: p.emergencyContacts.map(emergencyContactLine).join(' · ') || null,
      },
      { label: PATIENT_DETAIL_TEXT.insurer, value: p.insurer?.name ?? PATIENT_DETAIL_TEXT.selfPay },
      { label: PATIENT_DETAIL_TEXT.policy, value: p.insurancePolicyNumber, mono: true },
      { label: PATIENT_DETAIL_TEXT.validUntil, value: p.insuranceExpiryDate },
      {
        label: PATIENT_DETAIL_TEXT.insurerPays,
        value: p.insuranceCoveragePercent ? `${+p.insuranceCoveragePercent}%` : null,
      },
      {
        label: PATIENT_DETAIL_TEXT.portalAccount,
        value: p.hasPortalAccount ? PATIENT_DETAIL_TEXT.yes : PATIENT_DETAIL_TEXT.no,
      },
      { label: PATIENT_DETAIL_TEXT.notes, value: p.notes },
    ];
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.error.set(null);
    try {
      this.patient.set(await firstValueFrom(this.api.get(this.id())));
      void this.loadVisits();
    } catch (error) {
      this.error.set(error as ApiError);
    }
  }

  /** Where a timeline entry opens. */
  protected timelineLink(entry: PatientTimelineEntry): string[] {
    const base =
      {
        treatment: '/clinic/treatments',
        order: '/clinic/clinical-orders',
        referral: '/clinic/clinical-orders',
      }[entry.kind] ?? '/clinic/appointments';
    return [base, entry.id];
  }

  protected async loadTimeline(): Promise<void> {
    if (this.timeline() === null) {
      this.timeline.set(await firstValueFrom(this.api.timeline(this.id())).catch(() => []));
    }
  }

  private async loadVisits(): Promise<void> {
    const today = clinicIsoDate();
    const page = await firstValueFrom(
      this.client.list<Appointment>('appointments', {
        perPage: 100,
        sort: ['-scheduledDate', '-startTime'],
        filter: { and: [{ patientId: { eq: this.id() } }] },
      }),
    ).catch(() => ({ data: [] as Appointment[] }));
    this.upcoming.set(
      page.data
        .filter(
          (a) =>
            a.scheduledDate >= today &&
            ['pending', 'confirmed', 'checked_in', 'in_progress'].includes(a.status),
        )
        .reverse(),
    );
    this.past.set(page.data.filter((a) => !this.upcoming().includes(a)));
  }

  protected readonly book = async (): Promise<void> => {
    if (await this.bookings.book({ patient: this.patient() })) await this.loadVisits();
  };

  protected readonly editFile = async (): Promise<void> => {
    const saved = await this.dialogs.open<PatientFormDialog, PatientFormDialogData, Patient>(
      PatientFormDialog,
      { patient: this.patient()! },
      { width: '760px' },
    );
    if (saved) {
      this.patient.set(saved);
      this.notify.success(PATIENT_DETAIL_TEXT.patientFileSaved);
    }
  };

  protected readonly editHistory = async (): Promise<void> => {
    const saved = await this.dialogs.open<MedicalHistoryDialog, PatientFormDialogData, Patient>(
      MedicalHistoryDialog,
      { patient: this.patient()! },
      { width: '640px' },
    );
    if (saved) {
      this.patient.set(saved);
      this.notify.success(PATIENT_DETAIL_TEXT.medicalHistorySaved);
    }
  };

  protected readonly editPerson = async (): Promise<void> => {
    const saved = await this.dialogs.open<PersonFormDialog, PersonFormDialogData, boolean>(
      PersonFormDialog,
      {
        person: this.patient()!.person,
        save: (payload) => firstValueFrom(this.users.updatePerson(this.id(), payload)),
      },
      { width: '720px' },
    );
    if (saved) {
      this.notify.success(PATIENT_DETAIL_TEXT.personalDataSaved);
      await this.load();
    }
  };

  protected readonly createPortal = async (): Promise<void> => {
    await firstValueFrom(this.api.createPortalAccount(this.id()));
    this.notify.success(PATIENT_DETAIL_TEXT.portalAccountCreatedTheInvitation);
    await this.load();
  };
}

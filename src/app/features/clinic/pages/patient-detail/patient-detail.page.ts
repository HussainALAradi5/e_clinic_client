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
import { AppointmentRows } from '../../components/appointment-rows/appointment-rows.component';
import { PatientBilling } from '../../../billing/components/patient-billing/patient-billing.component';
import { PatientMedicines } from '../../../pharmacy/components/patient-medicines/patient-medicines.component';
import { ConsentsPanel } from '../../components/consents-panel/consents-panel.component';
import { PatientCare } from '../../components/patient-care/patient-care.component';
import { PatientFormDialog } from '../../components/patient-form-dialog/patient-form-dialog.component';
import { PatientFormDialogData } from '../../interfaces/dialog-data.interface';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { PersonFormDialog } from '../../../system/users/components/person-form-dialog/person-form-dialog.component';
import { PersonFormDialogData } from '../../../system/users/interfaces/dialog-data.interface';
import { AppointmentActions } from '../../services/appointment-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { AuditHistory } from '@shared/components/audit-history/audit-history.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Facts } from '@shared/components/facts/facts.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { Appointment } from '@shared/interfaces/clinic/appointment.interface';
import { Patient, PatientTimelineEntry } from '@shared/interfaces/clinic/patient.interface';
import { ConfirmConfig } from '@shared/interfaces/ui/confirm-config.interface';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { ApiClient } from '@shared/services/api/api-client.service';
import { PatientApi } from '@shared/services/clinic/patient-api.service';
import { EnumService } from '@shared/services/data/enum.service';
import { UserApi } from '@shared/services/identity/user-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { clinicIsoDate } from '@shared/utils/clinic-time';

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
    title: 'Create a portal account?',
    message: 'The patient receives an email to set a password, then books and sees results online.',
    confirmLabel: 'Create account',
  };

  protected readonly personal = computed<Fact[]>(() => {
    const p = this.patient();
    if (!p) return [];
    return [
      { label: 'File number', value: p.code, mono: true },
      { label: 'Gender', value: p.gender, enum: 'Gender' },
      { label: 'Date of birth', value: `${p.dateOfBirth} (${p.age} y)` },
      { label: 'National ID', value: p.person.nationalId, mono: true },
      {
        label: 'Nationality',
        value: p.person.nationality?.nationality,
        flag: p.person.nationalityCode,
      },
      { label: 'Mobile', value: p.phone },
      { label: 'Email', value: p.email },
      { label: 'Address', value: p.person.address?.formatted },
    ];
  });

  protected readonly file = computed<Fact[]>(() => {
    const p = this.patient();
    if (!p) return [];
    return [
      ...(p.bloodGroup
        ? [{ label: 'Blood group', value: this.enums.label('BloodGroup', p.bloodGroup) }]
        : []),
      ...(p.bloodGroup !== undefined
        ? [{ label: 'Chronic conditions', value: p.chronicConditions }]
        : []),
      {
        label: 'Emergency contact',
        value: p.emergencyContactName
          ? `${p.emergencyContactName} (${p.emergencyContactRelation ?? '—'}) ${p.emergencyContactPhone ?? ''}`
          : null,
      },
      { label: 'Insurer', value: p.insurer?.name ?? 'Self-pay' },
      { label: 'Policy', value: p.insurancePolicyNumber, mono: true },
      { label: 'Valid until', value: p.insuranceExpiryDate },
      {
        label: 'Insurer pays',
        value: p.insuranceCoveragePercent ? `${+p.insuranceCoveragePercent}%` : null,
      },
      { label: 'Portal account', value: p.hasPortalAccount ? 'Yes' : 'No' },
      { label: 'Notes', value: p.notes },
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
      this.notify.success('Patient file saved.');
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
      this.notify.success('Personal data saved.');
      await this.load();
    }
  };

  protected readonly createPortal = async (): Promise<void> => {
    await firstValueFrom(this.api.createPortalAccount(this.id()));
    this.notify.success('Portal account created — the invitation email is on its way.');
    await this.load();
  };
}

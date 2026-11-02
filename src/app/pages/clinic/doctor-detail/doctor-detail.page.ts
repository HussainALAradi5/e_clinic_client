import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppointmentRows } from '@components/clinic/appointment-rows/appointment-rows.component';
import { DoctorFormDialog } from '@components/clinic/doctor-form-dialog/doctor-form-dialog.component';
import { DoctorFormDialogData } from '@interfaces/clinic/doctor-form-dialog-data.interface';
import { weekRows } from '@utilities/clinic/schedule';
import { AppointmentActions } from '@services/clinic/appointment-actions.service';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { ButtonVariant } from '@enums/ui/button.enum';
import { ApiError } from '@interfaces/api/api-error.interface';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { Doctor } from '@interfaces/clinic/doctor.interface';
import { ScheduleBlock } from '@interfaces/clinic/schedule.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { AccessService } from '@services/auth/access.service';
import { ApiClient } from '@services/api/api-client.service';
import { DoctorApi } from '@services/clinic/doctor-api.service';
import { ScheduleApi } from '@services/clinic/schedule-api.service';
import { EnumService } from '@services/data/enum.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { formatMoney } from '@utilities/money';

/** `/clinic/doctors/:id` — profile, fees, weekly schedule, upcoming bookings; booking switch. */
@Component({
  selector: 'app-doctor-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    AuditHistory,
    AppointmentRows,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSlideToggleModule,
    RouterLink,
    HasAccessDirective,
  ],
  templateUrl: './doctor-detail.page.html',
})
export class DoctorDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(DoctorApi);
  private readonly schedules = inject(ScheduleApi);
  private readonly client = inject(ApiClient);
  private readonly dialogs = inject(DialogService);
  private readonly bookings = inject(AppointmentActions);
  private readonly notify = inject(NotifyService);
  private readonly enums = inject(EnumService);
  protected readonly canWrite = inject(AccessService).can('doctors.write');

  protected readonly doctor = signal<Doctor | null>(null);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly week = signal<ScheduleBlock[]>([]);
  protected readonly upcoming = signal<Appointment[]>([]);
  protected readonly variants = ButtonVariant;
  protected readonly rows = computed(() =>
    weekRows(this.week(), (d) => this.enums.label('DayOfWeek', d)),
  );

  protected readonly profile = computed<Fact[]>(() => {
    const d = this.doctor();
    if (!d) return [];
    return [
      { label: 'Specialty', value: d.specialty?.name },
      { label: 'Title', value: d.title },
      { label: 'Department', value: d.department?.name },
      { label: 'NHRA licence', value: d.licenseNumber, mono: true },
      { label: 'Licence valid until', value: d.licenseExpiryDate },
      {
        label: 'Consultation',
        value: d.consultationService
          ? `${d.consultationService.name} — ${formatMoney(d.consultationService.price)}`
          : null,
      },
      {
        label: 'Follow-up',
        value: d.followUpService
          ? `${d.followUpService.name} — ${formatMoney(d.followUpService.price)}`
          : null,
      },
      { label: 'Slot length', value: `${d.defaultSlotMinutes} min` },
      { label: 'Daily limit', value: d.maxDailyAppointments ?? 'None' },
      {
        label: 'Usual room',
        value: d.defaultRoom ? `${d.defaultRoom.code} · ${d.defaultRoom.name}` : null,
      },
      { label: 'Mobile', value: d.phone },
    ];
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.error.set(null);
    try {
      this.doctor.set(await firstValueFrom(this.api.get(this.id())));
      this.week.set(await firstValueFrom(this.schedules.week(this.id())).catch(() => []));
      const page = await firstValueFrom(
        this.client.list<Appointment>('appointments', {
          perPage: 30,
          sort: ['scheduledDate', 'startTime'],
          filter: {
            and: [
              { providerId: { eq: this.id() } },
              { scheduledDate: { gte: clinicIsoDate() } },
              { status: { in: ['pending', 'confirmed', 'checked_in', 'in_progress'] } },
            ],
          },
        }),
      ).catch(() => ({ data: [] as Appointment[] }));
      this.upcoming.set(page.data);
    } catch (error) {
      this.error.set(error as ApiError);
    }
  }

  protected async setAccepting(accepting: boolean): Promise<void> {
    this.doctor.set(await firstValueFrom(this.api.setAccepting(this.id(), accepting)));
    this.notify.success(
      accepting ? 'New bookings are open.' : 'New bookings paused — existing ones stay.',
    );
  }

  protected readonly edit = async (): Promise<void> => {
    const saved = await this.dialogs.open<DoctorFormDialog, DoctorFormDialogData, Doctor>(
      DoctorFormDialog,
      { doctor: this.doctor() },
      { width: '760px' },
    );
    if (saved) {
      this.doctor.set(saved);
      this.notify.success('Doctor profile saved.');
    }
  };

  protected readonly book = async (): Promise<void> => {
    if (await this.bookings.book({ doctor: this.doctor() })) await this.load();
  };
}

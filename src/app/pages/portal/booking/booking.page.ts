import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { visitDay } from '@services/portal/portal-actions.service';
import { newIdempotencyKey } from '@middlewares/interceptors/http-context';
import { AppButton } from '@components/common/app-button/app-button.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { PORTAL_PATH } from '@constants/app.constants';
import { AppointmentType } from '@enums/clinic/appointment-type.enum';
import { LockMode } from '@enums/ui/lock-mode.enum';
import { Slot } from '@interfaces/clinic/slot.interface';
import { Doctor } from '@interfaces/clinic/doctor.interface';
import { Specialty } from '@interfaces/clinic/specialty.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { DoctorApi, SpecialtyApi } from '@services/clinic/doctor-api.service';
import { PortalApi } from '@services/portal/portal-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { addDays, clinicIsoDate } from '@utilities/clinic-time';
import { BOOKING_TEXT } from '@constants/portal/booking.constants';

/** Days offered in the date strip (the clinic books up to 90 days ahead; most patients look at the next two weeks). */
const DAYS_SHOWN = 21;

/**
 * `/portal/appointments/new` — kind of visit → specialty → doctor → day and free time → optional reason → book.
 * Times are at least two hours ahead; the booking starts as pending until the clinic confirms it.
 */
@Component({
  selector: 'app-portal-booking-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    AppButton,
    Skeleton,
    TextField,
    MoneyPipe,
  ],
  templateUrl: './booking.page.html',
  styleUrl: './booking.page.scss',
})
export class PortalBookingPage {
  private readonly portal = inject(PortalApi);
  private readonly doctorApi = inject(DoctorApi);
  private readonly specialtyApi = inject(SpecialtyApi);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);

  protected readonly visitsPath = `${PORTAL_PATH}/appointments`;
  protected readonly types = [
    { value: AppointmentType.Consultation, label: BOOKING_TEXT.newProblem },
    { value: AppointmentType.FollowUp, label: BOOKING_TEXT.followUp },
  ];
  protected readonly lockOnce = LockMode.Once;
  protected readonly days = Array.from({ length: DAYS_SHOWN }, (_, i) =>
    addDays(clinicIsoDate(), i),
  );

  protected readonly type = signal(AppointmentType.Consultation);
  protected readonly specialties = signal<Specialty[]>([]);
  protected readonly specialty = signal<string | null>(null);
  protected readonly allDoctors = signal<Doctor[] | null>(null);
  protected readonly doctor = signal<Doctor | null>(null);
  protected readonly date = signal<string | null>(null);
  protected readonly slots = signal<Slot[] | null>(null);
  protected readonly slot = signal<Slot | null>(null);
  protected readonly reason = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(500)],
  });

  protected readonly doctors = computed(() => {
    const specialty = this.specialty();
    return (this.allDoctors() ?? []).filter((d) => !specialty || d.specialtyId === specialty);
  });
  protected readonly price = computed(() => {
    const d = this.doctor();
    const service =
      this.type() === AppointmentType.FollowUp ? d?.followUpService : d?.consultationService;
    return service?.price ?? null;
  });
  protected readonly summary = computed(() => {
    const [d, day, s] = [this.doctor(), this.date(), this.slot()];
    return d && day && s ? `${visitDay(day)} at ${s.startTime} with ${d.displayName}` : null;
  });

  private key = newIdempotencyKey();

  constructor() {
    void this.loadChoices();
  }

  protected pickType(type: AppointmentType): void {
    this.type.set(type);
    this.reloadSlots();
  }

  protected pickSpecialty(id: string | null): void {
    this.specialty.set(id);
    if (this.doctor() && id && this.doctor()?.specialtyId !== id) this.pickDoctor(null);
  }

  protected pickDoctor(doctor: Doctor | null): void {
    this.doctor.set(doctor);
    this.date.set(doctor ? (this.date() ?? this.days[0]) : null);
    this.reloadSlots();
  }

  protected pickDate(day: string): void {
    this.date.set(day);
    this.reloadSlots();
  }

  protected readonly book = async (): Promise<void> => {
    const [doctor, date, slot] = [this.doctor(), this.date(), this.slot()];
    if (!doctor || !date || !slot) return;
    await firstValueFrom(
      this.portal.book(
        {
          doctorId: doctor.id,
          type: this.type(),
          scheduledDate: date,
          startTime: slot.startTime,
          reason: this.reason.value.trim() || null,
        },
        this.key,
      ),
    ).catch((error: unknown) => {
      // Someone else may have taken the time: show fresh times and let the patient pick again.
      this.key = newIdempotencyKey();
      this.reloadSlots();
      throw error;
    });
    this.notify.success(BOOKING_TEXT.bookingSentTheClinicWill);
    await this.router.navigateByUrl(this.visitsPath);
  };

  private async loadChoices(): Promise<void> {
    const [specialties, doctors] = await Promise.all([
      firstValueFrom(this.specialtyApi.list({ perPage: 100, sort: ['name'] })).catch(() => null),
      firstValueFrom(
        this.doctorApi.list({
          perPage: 100,
          filter: { and: [{ isAcceptingPatients: { eq: true } }] },
        }),
      ).catch(() => null),
    ]);
    const bookable = (doctors?.data ?? []).filter((d) => d.isBookable !== false);
    const offered = new Set(bookable.map((d) => d.specialtyId));
    this.specialties.set((specialties?.data ?? []).filter((s) => offered.has(s.id)));
    this.allDoctors.set(bookable);
  }

  private reloadSlots(): void {
    this.slot.set(null);
    this.slots.set(null);
    const [doctor, date] = [this.doctor(), this.date()];
    if (!doctor || !date) return;
    firstValueFrom(this.portal.slots(doctor.id, date, this.type()))
      .then((slots) => {
        // Ignore answers for a selection the patient has already changed.
        if (this.doctor() === doctor && this.date() === date) this.slots.set(slots);
      })
      .catch(() => this.slots.set([]));
  }
}

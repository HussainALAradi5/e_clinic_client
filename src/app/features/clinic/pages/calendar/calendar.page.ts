import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppointmentActions } from '../../services/appointment-actions.service';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { statusTone, TONE_CLASSES } from '@shared/constants/status-tones.constants';
import { Appointment } from '@shared/interfaces/clinic/appointment.interface';
import { Doctor } from '@shared/interfaces/clinic/doctor.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { AccessService } from '@shared/services/auth/access.service';
import { ApiClient } from '@shared/services/api/api-client.service';
import { AppointmentApi } from '@shared/services/clinic/appointment-api.service';
import { addDays, clinicIsoDate, clinicTime } from '@shared/utils/clinic-time';

type CalendarView = 'day' | 'week';

/** One calendar column: a doctor (day view) or a date (week view). */
interface Column {
  key: string;
  title: string;
  subtitle: string;
  doctor: Doctor;
  date: string;
  items: Appointment[];
}

/** Vertical scale and the visible hours (stretched when bookings fall outside). */
const PX_PER_MINUTE = 1.6;
const FIRST_HOUR = 7;
const LAST_HOUR = 21;
/** Clicks on free space snap to this grid; the wizard then shows the real free times. */
const SNAP_MINUTES = 15;

function minutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function hhmm(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * `/clinic/calendar` — a day with one column per doctor, or a doctor's week. Click a booking to open it; click free
 * space to book there (the wizard checks the doctor's real free times).
 */
@Component({
  selector: 'app-calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    DatePipe,
    EnumLabelPipe,
  ],
  templateUrl: './calendar.page.html',
})
export class CalendarPage {
  private readonly api = inject(AppointmentApi);
  private readonly client = inject(ApiClient);
  private readonly actions = inject(AppointmentActions);
  private readonly router = inject(Router);
  protected readonly canBook = inject(AccessService).can('appointments.create');

  protected readonly view = signal<CalendarView>('day');
  protected readonly date = signal(clinicIsoDate());
  protected readonly doctors = signal<Doctor[]>([]);
  protected readonly doctorId = signal<string | null>(null);
  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly loading = signal(false);
  protected readonly now = signal(Date.now());
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly pxPerMinute = PX_PER_MINUTE;

  /** Visible range: Sunday-based week, or the single day. */
  protected readonly range = computed(() => {
    const date = this.date();
    if (this.view() === 'day') return { from: date, to: date };
    const from = addDays(date, -new Date(`${date}T00:00:00Z`).getUTCDay());
    return { from, to: addDays(from, 6) };
  });
  protected readonly doctor = computed<Doctor | null>(
    () => this.doctors().find((d) => d.id === this.doctorId()) ?? this.doctors()[0] ?? null,
  );

  protected readonly columns = computed<Column[]>(() => {
    const list = this.appointments();
    if (this.view() === 'day') {
      const date = this.date();
      const shown = this.doctorId()
        ? this.doctors().filter((d) => d.id === this.doctorId())
        : this.doctors();
      return shown.map((doctor) => ({
        key: doctor.id,
        title: doctor.displayName,
        subtitle: doctor.specialty?.name ?? '',
        doctor,
        date,
        items: list.filter((a) => a.providerId === doctor.id),
      }));
    }
    const doctor = this.doctor();
    if (!doctor) return [];
    return Array.from({ length: 7 }, (_, i) => addDays(this.range().from, i)).map((date) => ({
      key: date,
      title: date,
      subtitle: '',
      doctor,
      date,
      items: list.filter((a) => a.scheduledDate === date),
    }));
  });

  /** Hours shown on the left: the usual clinic day, widened to every booking in view. */
  protected readonly hours = computed(() => {
    let first = FIRST_HOUR * 60;
    let last = LAST_HOUR * 60;
    for (const a of this.appointments()) {
      first = Math.min(first, minutes(a.startTime));
      last = Math.max(last, minutes(a.endTime));
    }
    const start = Math.floor(first / 60);
    const end = Math.ceil(last / 60);
    return Array.from({ length: end - start }, (_, i) => start + i);
  });
  protected readonly dayStart = computed(() => this.hours()[0] * 60);
  protected readonly height = computed(() => this.hours().length * 60 * PX_PER_MINUTE);
  /** Offset of the "now" line, or null when today is not in view. */
  protected readonly nowOffset = computed(() => {
    const today = clinicIsoDate(new Date(this.now()));
    const { from, to } = this.range();
    if (today < from || today > to) return null;
    const offset = (minutes(clinicTime(new Date(this.now()))) - this.dayStart()) * PX_PER_MINUTE;
    return offset >= 0 && offset <= this.height() ? { today, offset } : null;
  });

  constructor() {
    void this.loadDoctors();
    effect(() => {
      const { from, to } = this.range();
      const providerId = this.view() === 'week' ? this.doctor()?.id : null;
      if (this.view() === 'week' && !providerId) return;
      untracked(() => void this.load(from, to, providerId ?? null));
    });
    const timer = setInterval(() => this.now.set(Date.now()), 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected setView(view: CalendarView): void {
    this.view.set(view);
  }

  protected step(direction: -1 | 1): void {
    this.date.update((d) => addDays(d, direction * (this.view() === 'day' ? 1 : 7)));
  }

  protected goToday(): void {
    this.date.set(clinicIsoDate());
  }

  protected pickDate(value: string): void {
    if (value) this.date.set(value);
  }

  protected pickDoctor(id: string): void {
    this.doctorId.set(id || null);
  }

  protected openDay(date: string): void {
    this.date.set(date);
    this.view.set('day');
  }

  protected top(a: Appointment): number {
    return (minutes(a.startTime) - this.dayStart()) * PX_PER_MINUTE;
  }

  protected blockHeight(a: Appointment): number {
    return Math.max(18, (minutes(a.endTime) - minutes(a.startTime)) * PX_PER_MINUTE - 2);
  }

  protected tone(a: Appointment): string {
    return TONE_CLASSES[statusTone('AppointmentStatus', a.status)];
  }

  protected open(a: Appointment, event: Event): void {
    event.stopPropagation();
    void this.router.navigate(['/clinic/appointments', a.id]);
  }

  /** Click on free space → booking wizard preset with that doctor, day and (snapped) time. */
  protected async bookAt(column: Column, event: MouseEvent): Promise<void> {
    if (!this.canBook) return;
    const y = event.offsetY;
    const at = this.dayStart() + Math.floor(y / PX_PER_MINUTE / SNAP_MINUTES) * SNAP_MINUTES;
    const booked = await this.actions.book({
      doctor: column.doctor,
      date: column.date,
      startTime: hhmm(at),
    });
    if (booked) await this.reload();
  }

  protected readonly book = async (): Promise<void> => {
    if (
      await this.actions.book({
        doctor: this.view() === 'week' ? this.doctor() : null,
        date: this.date(),
      })
    )
      await this.reload();
  };

  protected async reload(): Promise<void> {
    const { from, to } = this.range();
    await this.load(from, to, this.view() === 'week' ? (this.doctor()?.id ?? null) : null);
  }

  private async loadDoctors(): Promise<void> {
    const page = await firstValueFrom(
      this.client.list<Doctor>('doctors', { page: 1, perPage: 100 }),
    ).catch(() => null);
    this.doctors.set((page?.data ?? []).sort((a, b) => a.fullName.localeCompare(b.fullName)));
  }

  private async load(from: string, to: string, providerId: string | null): Promise<void> {
    this.loading.set(true);
    try {
      this.appointments.set(await firstValueFrom(this.api.calendar(from, to, { providerId })));
    } catch {
      this.appointments.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { firstValueFrom } from 'rxjs';
import { AppointmentType } from '@enums/clinic/appointment-type.enum';
import { ApiError } from '@interfaces/api/api-error.interface';
import { Slot } from '@interfaces/clinic/appointment.interface';
import { AppointmentApi } from '@services/clinic/appointment-api.service';

/**
 * Free slots of a provider on a date as chips (GET /appointments/available-slots); two-way `[(start)]` = HH:mm.
 * Reloads whenever provider, date, type or room change.
 */
@Component({
  selector: 'app-slot-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatChipsModule, MatIconModule, MatProgressBarModule],
  host: { class: 'block' },
  templateUrl: './slot-picker.component.html',
})
export class SlotPicker {
  readonly providerId = input.required<string | null>();
  readonly date = input.required<string | null>();
  readonly type = input<AppointmentType>(AppointmentType.Consultation);
  readonly roomId = input<string | null>(null);
  /** Chosen start time (HH:mm). */
  readonly start = model<string | null>(null);

  private readonly api = inject(AppointmentApi);
  protected readonly slots = signal<Slot[] | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<ApiError | null>(null);

  constructor() {
    effect(() => {
      const provider = this.providerId();
      const date = this.date();
      const type = this.type();
      const room = this.roomId();
      untracked(() => void this.load(provider, date, type, room));
    });
  }

  private async load(
    provider: string | null,
    date: string | null,
    type: AppointmentType,
    room: string | null,
  ): Promise<void> {
    // Keep a preset / earlier pick when it is still free (e.g. the time clicked on the calendar).
    const wanted = this.start();
    this.start.set(null);
    this.error.set(null);
    if (!provider || !date) {
      this.slots.set(null);
      return;
    }
    this.loading.set(true);
    try {
      const slots = await firstValueFrom(this.api.availableSlots(provider, date, type, room));
      this.slots.set(slots);
      if (slots.some((slot) => slot.startTime === wanted)) this.start.set(wanted);
    } catch (error) {
      this.slots.set([]);
      this.error.set(error as ApiError);
    } finally {
      this.loading.set(false);
    }
  }
}

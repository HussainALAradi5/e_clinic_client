import { ClockPipe } from '@pipes/clock.pipe';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CANCELLABLE, PortalActions } from '@services/portal/portal-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';
import { ButtonSize } from '@enums/ui/button-size.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { EnumService } from '@services/data/enum.service';
import { TONE_STRIPE_CLASSES } from '@constants/status-tones.constants';
import { VISIT_CARD_TEXT } from '@constants/portal/visit-card.constants';

/** Statuses for which the check-in code still means something. */
const CODE_STATUSES = [
  AppointmentStatus.Pending,
  AppointmentStatus.Confirmed,
  AppointmentStatus.CheckedIn,
];

/**
 * One visit. `pass` = the home page's next-visit ticket (pine, large time); otherwise a list row. Upcoming visits
 * offer the check-in code and, while still open, online cancellation.
 */
@Component({
  selector: 'app-visit-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ClockPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    AppButton,
    StatusChip,
    EnumLabelPipe,
  ],
  templateUrl: './visit-card.component.html',
  styleUrl: './visit-card.component.scss',
})
export class VisitCard {
  protected readonly text = VISIT_CARD_TEXT;

  readonly visit = input.required<Appointment>();
  readonly pass = input(false);
  readonly changed = output<Appointment>();

  private readonly actions = inject(PortalActions);
  private readonly enums = inject(EnumService);
  protected readonly variants = ButtonVariant;
  protected readonly sizes = ButtonSize;

  protected readonly day = computed(() => `${this.visit().scheduledDate}T00:00:00`);
  protected readonly upcoming = computed(
    () => new Date(this.visit().endsAt).getTime() > Date.now(),
  );
  protected readonly showCode = computed(
    () => this.upcoming() && CODE_STATUSES.includes(this.visit().status),
  );
  protected readonly cancellable = computed(
    () => this.upcoming() && CANCELLABLE.includes(this.visit().status),
  );
  /** Online changes stop 3 days before; closer, the patient calls reception (who can cancel for them). */
  protected readonly selfCancel = computed(
    () => this.cancellable() && this.visit().patientCanChange,
  );
  protected readonly session = computed(() => this.visit().sessionNumber !== null);
  /** The coloured left edge of a list row: coming, today, past or missed. */
  protected readonly stripe = computed(
    () => TONE_STRIPE_CLASSES[this.enums.tone('VisitTiming', this.visit().timing)],
  );

  protected code(): void {
    this.actions.showVisitCode(this.visit());
  }

  protected readonly cancel = async (): Promise<void> => {
    const updated = await this.actions.cancelVisit(this.visit());
    if (updated) this.changed.emit(updated);
  };
}

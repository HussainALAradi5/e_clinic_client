import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CANCELLABLE, PortalActions } from '@services/portal/portal-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';
import { ButtonSize, ButtonVariant } from '@enums/ui/button.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';

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
  imports: [DatePipe, MatButtonModule, MatIconModule, AppButton, StatusChip, EnumLabelPipe],
  templateUrl: './visit-card.component.html',
  styleUrl: './visit-card.component.scss',
})
export class VisitCard {
  readonly visit = input.required<Appointment>();
  readonly pass = input(false);
  readonly changed = output<Appointment>();

  private readonly actions = inject(PortalActions);
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
  protected readonly session = computed(() => this.visit().sessionNumber !== null);

  protected code(): void {
    this.actions.showVisitCode(this.visit());
  }

  protected readonly cancel = async (): Promise<void> => {
    const updated = await this.actions.cancelVisit(this.visit());
    if (updated) this.changed.emit(updated);
  };
}

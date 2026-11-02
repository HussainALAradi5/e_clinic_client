import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { AppointmentActions } from '@services/clinic/appointment-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { ButtonSize } from '@enums/ui/button.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';

/** Buttons for every status action the booking allows; emits the updated booking. */
@Component({
  selector: 'app-appointment-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButton],
  host: { class: 'flex flex-wrap items-center gap-2' },
  templateUrl: './appointment-actions.component.html',
})
export class AppointmentActionsBar {
  readonly appointment = input.required<Appointment>();
  readonly compact = input(false);
  /** Only these action keys (e.g. the front-desk card shows the next step only). */
  readonly only = input<string[] | null>(null);
  readonly changed = output<Appointment>();

  private readonly actions = inject(AppointmentActions);
  protected readonly size = computed(() => (this.compact() ? ButtonSize.Small : ButtonSize.Medium));
  protected readonly items = computed(() => {
    const only = this.only();
    return this.actions
      .for(this.appointment())
      .filter((a) => !only || only.includes(a.key))
      .map((a) => ({
        ...a,
        go: async (): Promise<void> => {
          const updated = await a.run();
          if (updated) this.changed.emit(updated);
        },
      }));
  });
}

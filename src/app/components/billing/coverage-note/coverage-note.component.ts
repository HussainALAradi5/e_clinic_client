import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { COVERAGE_TEXT } from '@constants/billing/coverage.constants';
import { Coverage } from '@interfaces/billing/coverage.interface';
import { MoneyPipe } from '@pipes/money.pipe';

/**
 * The insurer / patient split above a payment: who covers what and what the patient pays now. With `payAll`
 * the patient chooses to pay the insurer's share too. Says why when the insurer pays nothing (expired policy,
 * rejected claim). Shows nothing for uninsured patients.
 */
@Component({
  selector: 'app-coverage-note',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatCheckboxModule, MatIconModule, MoneyPipe],
  host: { class: 'block' },
  template: `
    @let c = coverage();
    @if (c.covered) {
      <div
        class="motion-rise rounded-xl border border-primary/40 bg-primary-container/40 px-4 py-3"
      >
        <p class="m-0 flex items-center gap-2 text-sm font-medium">
          <mat-icon class="text-primary">health_and_safety</mat-icon>
          {{ text.insurer(c.insurer ?? '', c.coveragePercent) }}
        </p>
        <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
          <span class="text-on-surface-variant">{{ text.insurerShare }}</span>
          <span class="text-right tabular-nums">{{ c.insurerShare | money }}</span>
          <span class="font-semibold">{{ text.patientDue }}</span>
          <span class="text-right font-semibold tabular-nums">{{ c.patientDue | money }}</span>
        </div>
        @if (choosable()) {
          <mat-checkbox class="-ml-2 mt-1" [(ngModel)]="payAll">{{ text.payAll }}</mat-checkbox>
        }
      </div>
    } @else if (reasonText(); as why) {
      <p
        class="motion-rise m-0 flex items-center gap-2 rounded-xl bg-secondary-container px-4 py-3 text-sm text-on-secondary-container"
      >
        <mat-icon>info</mat-icon>{{ why }}
      </p>
    }
  `,
})
export class CoverageNote {
  readonly coverage = input.required<Coverage>();
  /** Offer "the patient pays it all" (payment dialog only). */
  readonly choosable = input(true);
  /** The patient pays the insurer's share too. */
  readonly payAll = model(false);

  protected readonly text = COVERAGE_TEXT;
  protected readonly reasonText = computed(() => {
    const reason = this.coverage().reason;
    return reason ? (COVERAGE_TEXT.reasons[reason] ?? null) : null;
  });
}

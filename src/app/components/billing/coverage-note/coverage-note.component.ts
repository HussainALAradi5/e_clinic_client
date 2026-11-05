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
  templateUrl: './coverage-note.component.html',
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

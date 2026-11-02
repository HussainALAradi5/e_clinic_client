import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { PrintSheet } from '@components/common/print-sheet/print-sheet.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { InsuranceClaim } from '@interfaces/billing/insurance-claim.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { InsuranceClaimApi } from '@services/billing/insurance-claim-api.service';

/** `/print/claim/:id` — claim form for the insurer: patient, policy, pre-authorisation, ICD-10, services, amounts. */
@Component({
  selector: 'app-claim-form-print-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrintSheet, ErrorState, MoneyPipe, DatePipe],
  templateUrl: './claim-form-print.page.html',
})
export class ClaimFormPrintPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(InsuranceClaimApi);
  protected readonly claim = signal<InsuranceClaim | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly dateFormat = DATE_FORMAT;

  async ngOnInit(): Promise<void> {
    try {
      this.claim.set(await firstValueFrom(this.api.get(this.id())));
    } catch (error) {
      this.error.set(error);
    }
  }
}

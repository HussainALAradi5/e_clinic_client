import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { PrintSheet } from '@shared/components/print-sheet/print-sheet.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { InsuranceClaim } from '@shared/interfaces/billing/insurance-claim.interface';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { InsuranceClaimApi } from '@shared/services/billing/insurance-claim-api.service';

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

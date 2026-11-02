import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BillingActions } from '@services/billing/billing-actions.service';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { ApiError } from '@interfaces/api/api-error.interface';
import { InsuranceClaim } from '@interfaces/billing/insurance-claim.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { InsuranceClaimApi } from '@services/billing/insurance-claim-api.service';
import { clinicDateTime } from '@utilities/clinic-time';
import { formatMoney } from '@utilities/money';
import { CLAIM_DETAIL_TEXT } from '@constants/billing/claim-detail.constants';

/** `/billing/insurance-claims/:id` — the claim, its lines and diagnoses, the next step and history. */
@Component({
  selector: 'app-claim-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    AuditHistory,
    HasAccessDirective,
    MoneyPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    RouterLink,
  ],
  templateUrl: './claim-detail.page.html',
})
export class ClaimDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(InsuranceClaimApi);
  private readonly actions = inject(BillingActions);

  protected readonly variants = ButtonVariant;
  protected readonly claim = signal<InsuranceClaim | null>(null);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly status = computed(() => this.claim()?.status);
  protected readonly isDraft = computed(() => this.status() === ApprovalStatus.Draft);
  protected readonly isPending = computed(() => this.status() === ApprovalStatus.Pending);
  protected readonly facts = computed<Fact[]>(() => {
    const c = this.claim();
    if (!c) return [];
    return [
      {
        label: CLAIM_DETAIL_TEXT.patient,
        value: c.patient ? `${c.patient.fullName} · ${c.patient.code}` : null,
      },
      { label: CLAIM_DETAIL_TEXT.insurer, value: c.insurer?.name },
      { label: CLAIM_DETAIL_TEXT.policy, value: c.policyNumber },
      { label: CLAIM_DETAIL_TEXT.coverage, value: `${+c.coveragePercent}%` },
      { label: CLAIM_DETAIL_TEXT.preAuthorisation, value: c.preAuthorizationNumber },
      { label: CLAIM_DETAIL_TEXT.claimed, value: formatMoney(c.claimedAmount) },
      {
        label: CLAIM_DETAIL_TEXT.approved,
        value: c.approvedAmount ? formatMoney(c.approvedAmount) : null,
      },
      { label: CLAIM_DETAIL_TEXT.sent, value: clinicDateTime(c.submittedAt) },
      { label: CLAIM_DETAIL_TEXT.decided, value: clinicDateTime(c.decidedAt) },
      { label: CLAIM_DETAIL_TEXT.insurerReference, value: c.insurerReference },
      { label: CLAIM_DETAIL_TEXT.rejectedBecause, value: c.rejectionReason },
      { label: CLAIM_DETAIL_TEXT.cancelledBecause, value: c.cancellationReason },
      {
        label: CLAIM_DETAIL_TEXT.remitted,
        value: c.remittedAt ? `${c.remittedAt} · ${c.remittanceReference}` : null,
      },
    ].filter((f) => f.value !== null && f.value !== undefined && f.value !== '');
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  protected async load(): Promise<void> {
    try {
      this.error.set(null);
      this.claim.set(await firstValueFrom(this.api.get(this.id())));
    } catch (error) {
      this.error.set(error as ApiError);
    }
  }

  protected readonly submit = (): Promise<void> =>
    this.step(this.actions.submitClaim(this.current()));
  protected readonly decide = (): Promise<void> =>
    this.step(this.actions.decideClaim(this.current()));
  protected readonly cancel = (): Promise<void> =>
    this.step(this.actions.cancelClaim(this.current()));

  private current(): InsuranceClaim {
    return this.claim() as InsuranceClaim;
  }

  private async step(action: Promise<InsuranceClaim | undefined>): Promise<void> {
    if (await action) await this.load();
  }
}

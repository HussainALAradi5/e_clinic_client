import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT, DATE_TIME_FORMAT, TIME_FORMAT } from '@constants/app.constants';
import { STAFF_REQUEST_CARD_TEXT } from '@constants/hr/staff-request-card.constants';
import { STAFF_REQUESTS_TEXT } from '@constants/hr/staff-requests.constants';
import { StaffRequestType } from '@enums/hr/staff-request-type.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { RequestAmountLabel } from '@interfaces/hr/request-amount-label.interface';
import { ReviewDecision } from '@interfaces/hr/review-decision.type';
import { StaffRequest } from '@interfaces/hr/staff-request.interface';
import { DurationPipe } from '@pipes/duration.pipe';
import { MoneyPipe } from '@pipes/money.pipe';

/**
 * One late excuse or overtime request: who (for HR), the day, minutes, check-in / out, the money at stake, the
 * reason, HR's decision, and Approve / Reject (HR, not their own) or Withdraw (the employee, while pending).
 */
@Component({
  selector: 'app-staff-request-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DurationPipe, MoneyPipe, MatButtonModule, MatIconModule, StatusChip],
  templateUrl: './staff-request-card.component.html',
  styleUrl: './staff-request-card.component.scss',
})
export class StaffRequestCard {
  readonly request = input.required<StaffRequest>();
  /** HR: show who sent it. */
  readonly seesEveryone = input(false);
  readonly canReview = input(false);
  readonly meId = input<string | null>(null);
  readonly reviewed = output<ReviewDecision>();
  readonly withdrawn = output<void>();

  protected readonly text = STAFF_REQUEST_CARD_TEXT;
  protected readonly types = StaffRequestType;
  protected readonly statuses = ApprovalStatus;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly timeFormat = TIME_FORMAT;
  protected readonly zone = '+0300';

  protected readonly mine = computed(() => this.request().employeeId === this.meId());

  protected readonly initials = computed(() =>
    (this.request().employee?.fullName ?? '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join(''),
  );

  /** What the money means now: excused / paid once approved, deducted / not paid once rejected, at stake while pending. */
  protected readonly amount = computed<RequestAmountLabel>(() => {
    const r = this.request();
    const late = r.type === StaffRequestType.LateExcuse;
    switch (r.status) {
      case ApprovalStatus.Approved:
        return late
          ? { label: STAFF_REQUESTS_TEXT.excused, sign: '', tone: 'struck' }
          : { label: STAFF_REQUESTS_TEXT.paid, sign: '+', tone: 'plus' };
      case ApprovalStatus.Rejected:
        return late
          ? { label: STAFF_REQUESTS_TEXT.deducted, sign: '−', tone: 'minus' }
          : { label: STAFF_REQUESTS_TEXT.notPaid, sign: '', tone: 'struck' };
      default:
        return late
          ? { label: STAFF_REQUESTS_TEXT.ifNotExcused, sign: '−', tone: 'minus' }
          : { label: STAFF_REQUESTS_TEXT.toPay, sign: '+', tone: 'plus' };
    }
  });
}

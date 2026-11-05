import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { firstValueFrom } from 'rxjs';
import { LeaveBalances } from '@components/hr/leave-balances/leave-balances.component';
import { HrActions } from '@services/hr/hr-actions.service';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { UploadZone } from '@components/common/upload-zone/upload-zone.component';
import { AttachmentCategory } from '@enums/attachment/attachment-category.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Attachment } from '@interfaces/attachment/attachment.interface';
import { LeaveRequest } from '@interfaces/hr/leave-request.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { QtyPipe } from '@pipes/qty.pipe';
import { AccessService } from '@services/auth/access.service';
import { AuthStore } from '@services/auth/auth.store';
import { AttachmentApi } from '@services/attachment/attachment-api.service';
import { LeaveApi } from '@services/hr/leave-api.service';
import { clinicDateTime, clinicIsoDate } from '@utilities/clinic-time';
import { defaultQuery } from '@utilities/list-query';
import { formatQty } from '@utilities/quantity';
import { LEAVE_DETAIL_TEXT } from '@constants/hr/leave-detail.constants';

/** `/hr/leaves/:id` — a leave request, its certificate, the decision (by someone else) and its history. */
@Component({
  selector: 'app-leave-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    AuditHistory,
    UploadZone,
    LeaveBalances,
    HasAccessDirective,
    DecimalPipe,
    QtyPipe,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
  ],
  templateUrl: './leave-detail.page.html',
})
export class LeaveDetailPage implements OnInit {
  protected readonly text = LEAVE_DETAIL_TEXT;

  readonly id = input.required<string>();

  private readonly api = inject(LeaveApi);
  private readonly files = inject(AttachmentApi);
  private readonly actions = inject(HrActions);
  private readonly access = inject(AccessService);
  private readonly me = inject(AuthStore).user()?.id;
  protected readonly leave = signal<LeaveRequest | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly documents = signal<Attachment[]>([]);
  /** Bumped on every reload so the balances follow a decision. */
  protected readonly version = signal(0);
  protected readonly variants = ButtonVariant;
  protected readonly certificate = AttachmentCategory.MedicalCertificate;
  protected readonly owner = computed(() => ({ type: 'leave_request', id: this.id() }));

  protected readonly mine = computed(() => this.leave()?.employeeId === this.me);
  protected readonly status = computed(() => this.leave()?.status);
  protected readonly isDraft = computed(() => this.status() === ApprovalStatus.Draft);
  protected readonly decidable = computed(
    () => this.status() === ApprovalStatus.Pending && !this.mine(),
  );
  protected readonly cancellable = computed(() => {
    const l = this.leave();
    if (!l) return false;
    if (l.status === ApprovalStatus.Draft || l.status === ApprovalStatus.Pending) return true;
    return (
      l.status === ApprovalStatus.Approved &&
      l.startDate > clinicIsoDate() &&
      this.access.can('leaves.approve')
    );
  });
  protected readonly facts = computed<Fact[]>(() => {
    const l = this.leave();
    if (!l) return [];
    return [
      {
        label: LEAVE_DETAIL_TEXT.employee,
        value: l.employee ? `${l.employee.fullName} · ${l.employee.jobTitle}` : null,
      },
      { label: LEAVE_DETAIL_TEXT.department, value: l.employee?.department?.name },
      {
        label: LEAVE_DETAIL_TEXT.type,
        value: l.leaveType ? `${l.leaveType.name}${l.leaveType.isPaid ? '' : ' (unpaid)'}` : null,
      },
      { label: LEAVE_DETAIL_TEXT.from, value: l.startDate },
      { label: LEAVE_DETAIL_TEXT.to, value: l.endDate },
      {
        label: LEAVE_DETAIL_TEXT.workingDays,
        value: l.isHalfDay ? LEAVE_DETAIL_TEXT.halfADay : formatQty(l.totalDays),
      },
      { label: LEAVE_DETAIL_TEXT.reason, value: l.reason },
      {
        label:
          l.status === ApprovalStatus.Rejected
            ? LEAVE_DETAIL_TEXT.rejectedBy
            : LEAVE_DETAIL_TEXT.decidedBy,
        value: l.reviewedBy ? `${l.reviewedBy.fullName} · ${clinicDateTime(l.reviewedAt)}` : null,
      },
      { label: LEAVE_DETAIL_TEXT.note, value: l.reviewNotes },
    ].filter((f) => f.value !== null && f.value !== undefined && f.value !== '');
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  protected async load(): Promise<void> {
    this.error.set(null);
    try {
      this.leave.set(await firstValueFrom(this.api.get(this.id())));
      this.version.update((v) => v + 1);
      await this.loadDocuments();
    } catch (error) {
      this.error.set(error);
    }
  }

  protected async loadDocuments(): Promise<void> {
    const page = await firstValueFrom(
      this.files.listFor(this.owner(), defaultQuery({ perPage: 20 })),
    ).catch(() => null);
    this.documents.set(page?.data ?? []);
  }

  protected readonly view = async (file: Attachment): Promise<void> => {
    await firstValueFrom(this.files.download(file.id, true));
  };

  protected readonly submit = (): Promise<void> =>
    this.step(this.actions.submitLeave(this.record()));
  protected readonly approve = (): Promise<void> =>
    this.step(this.actions.approveLeave(this.record()));
  protected readonly reject = (): Promise<void> =>
    this.step(this.actions.rejectLeave(this.record()));
  protected readonly cancel = (): Promise<void> =>
    this.step(this.actions.cancelLeave(this.record()));

  private record(): LeaveRequest {
    return this.leave() as LeaveRequest;
  }

  private async step(action: Promise<LeaveRequest | undefined>): Promise<void> {
    if (await action) await this.load();
  }
}

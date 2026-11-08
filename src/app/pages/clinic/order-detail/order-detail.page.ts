import { wallClock } from '@utilities/clock-format';
import { dateTimeFormat } from '@utilities/clock-format';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BillingActions } from '@services/billing/billing-actions.service';
import { ClinicalActions } from '@services/clinic/clinical-actions.service';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { EntityActions } from '@components/common/entity-actions/entity-actions.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { ClinicalOrderType } from '@enums/clinic/clinical-order-type.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Attachment } from '@interfaces/attachment/attachment.interface';
import { ClinicalOrder } from '@interfaces/clinic/clinical-order.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { AttachmentApi } from '@services/attachment/attachment-api.service';
import { ClinicalOrderApi } from '@services/clinic/clinical-order-api.service';
import { EntityDetail } from '@services/data/entity-detail';
import { EnumService } from '@services/data/enum.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { formatMoney } from '@utilities/money';
import { ORDER_DETAIL_TEXT } from '@constants/clinic/order-detail.constants';

/** `/clinic/clinical-orders/:id` — the order or referral, its next step, the result with images, and history. */
@Component({
  selector: 'app-order-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    EntityActions,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    AuditHistory,
    HasAccessDirective,
    DatePipe,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    RouterLink,
  ],
  templateUrl: './order-detail.page.html',
})
export class OrderDetailPage implements OnInit {
  protected readonly text = ORDER_DETAIL_TEXT;

  readonly id = input.required<string>();

  private readonly api = inject(ClinicalOrderApi);
  protected readonly detail = new EntityDetail(this.api);
  private readonly actions = inject(ClinicalActions);
  private readonly files = inject(AttachmentApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  private readonly enums = inject(EnumService);

  protected readonly variants = ButtonVariant;
  protected readonly dateTimeFormat = dateTimeFormat;
  protected readonly cancellable = computed(
    () => this.detail.record()?.allowedTransitions.includes(GenericStatus.Cancelled) ?? false,
  );
  protected readonly referral = computed(
    () => this.detail.record()?.type === ClinicalOrderType.Referral,
  );
  protected readonly nextStep = computed(() => {
    const o = this.detail.record();
    if (!o) return null;
    if (o.status === GenericStatus.Pending) {
      if (o.type !== ClinicalOrderType.Referral)
        return {
          label: ORDER_DETAIL_TEXT.start,
          icon: 'play_arrow',
          access: 'orders.write & orders.perform',
        };
      return o.referredToCompanyId
        ? {
            label: ORDER_DETAIL_TEXT.letterSent,
            icon: 'outgoing_mail',
            access: 'orders.write & orders.perform',
          }
        : {
            label: ORDER_DETAIL_TEXT.bookVisit,
            icon: 'event_available',
            access: 'orders.write | appointments.create',
          };
    }
    if (
      o.status === GenericStatus.InProgress &&
      (o.type !== ClinicalOrderType.Referral || o.referredToCompanyId)
    ) {
      return {
        label:
          o.type === ClinicalOrderType.Referral
            ? ORDER_DETAIL_TEXT.replyReceived
            : ORDER_DETAIL_TEXT.recordResult,
        icon: 'task_alt',
        access: 'orders.write & orders.perform',
      };
    }
    return null;
  });
  /** Prepaid lab / imaging: an order with a price can be billed before it is done (once). */
  protected readonly billable = computed(() => {
    const o = this.detail.record();
    return (
      !!o &&
      !this.referral() &&
      !!o.billableService &&
      !o.invoice &&
      o.status !== GenericStatus.Cancelled
    );
  });
  private readonly billing = inject(BillingActions);

  protected readonly bill = async (): Promise<void> => {
    await this.billing.charge({ sourceType: 'clinical_order', sourceId: this.id() });
  };

  protected readonly facts = computed<Fact[]>(() => {
    const o = this.detail.record();
    if (!o) return [];
    const target =
      o.referredToDoctor?.fullName ?? o.referredToSpecialty?.name ?? o.referredToCompany?.name;
    return [
      { label: ORDER_DETAIL_TEXT.kind, value: this.enums.label('ClinicalOrderType', o.type) },
      { label: ORDER_DETAIL_TEXT.orderedBy, value: o.orderingDoctor?.fullName },
      { label: ORDER_DETAIL_TEXT.fromVisit, value: o.appointment?.code },
      {
        label: ORDER_DETAIL_TEXT.treatment,
        value: o.treatment ? `${o.treatment.code} · ${o.treatment.title}` : null,
      },
      {
        label: ORDER_DETAIL_TEXT.service,
        value: o.billableService
          ? `${o.billableService.name} · ${formatMoney(o.billableService.price)}`
          : null,
      },
      { label: ORDER_DETAIL_TEXT.bodyPartSample, value: o.bodyPart },
      { label: ORDER_DETAIL_TEXT.referredTo, value: target },
      {
        label: ORDER_DETAIL_TEXT.referredVisit,
        value: o.referralAppointment
          ? `${o.referralAppointment.code} · ${o.referralAppointment.scheduledDate} ${wallClock(o.referralAppointment.startTime)}`
          : null,
      },
      { label: ORDER_DETAIL_TEXT.room, value: o.room ? `${o.room.code} · ${o.room.name}` : null },
      { label: ORDER_DETAIL_TEXT.performedBy, value: o.performer?.fullName },
      { label: ORDER_DETAIL_TEXT.reportedBy, value: o.reporter?.fullName },
      { label: ORDER_DETAIL_TEXT.cancellationReason, value: o.cancellationReason },
    ].filter((f) => f.value !== null && f.value !== undefined);
  });

  ngOnInit(): void {
    void this.detail.load(this.id());
  }

  protected readonly next = async (): Promise<void> => {
    const o = this.detail.record();
    if (!o) return;
    const updated: ClinicalOrder | undefined =
      o.status === GenericStatus.Pending
        ? o.type === ClinicalOrderType.Referral && !o.referredToCompanyId
          ? await this.actions.linkReferral(o)
          : await this.actions.startOrder(o)
        : await this.actions.recordResult(o);
    if (updated) await this.detail.load(this.id());
  };

  protected readonly cancel = async (): Promise<void> => {
    const reason = await this.dialogs.reason({
      title: ORDER_DETAIL_TEXT.cancelThisOrder,
      confirmLabel: ORDER_DETAIL_TEXT.cancelOrder,
      danger: true,
    });
    if (!reason) return;
    this.detail.set(await firstValueFrom(this.api.cancel(this.id(), reason)));
    this.notify.success(ORDER_DETAIL_TEXT.orderCancelled);
  };

  protected readonly open = async (file: Attachment): Promise<void> => {
    await firstValueFrom(this.files.download(file.id, true));
  };

  protected readonly archive = async (): Promise<void> => {
    await this.detail.archive();
    this.notify.success(ORDER_DETAIL_TEXT.orderArchived);
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.detail.unarchive();
    this.notify.success(ORDER_DETAIL_TEXT.orderBackInLists);
  };

  protected readonly restore = async (): Promise<void> => {
    await this.detail.restore();
    this.notify.success(ORDER_DETAIL_TEXT.orderRestored);
  };

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success(ORDER_DETAIL_TEXT.orderDeleted);
    await this.router.navigateByUrl('/clinic/clinical-orders');
  };
}

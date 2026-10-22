import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BillingActions } from '../../../billing/services/billing-actions.service';
import { ClinicalActions } from '../../services/clinical-actions.service';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { AuditHistory } from '@shared/components/audit-history/audit-history.component';
import { EntityActions } from '@shared/components/entity-actions/entity-actions.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Facts } from '@shared/components/facts/facts.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { ClinicalOrderType } from '@shared/enums/clinic/clinical-order-type.enum';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Attachment } from '@shared/interfaces/attachment/attachment.interface';
import { ClinicalOrder } from '@shared/interfaces/clinic/clinical-order.interface';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { AttachmentApi } from '@shared/services/attachment/attachment-api.service';
import { ClinicalOrderApi } from '@shared/services/clinic/clinical-order-api.service';
import { EntityDetail } from '@shared/services/data/entity-detail';
import { EnumService } from '@shared/services/data/enum.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { formatMoney } from '@shared/utils/money';

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
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
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
        return { label: 'Start', icon: 'play_arrow', access: 'orders.write & orders.perform' };
      return o.referredToCompanyId
        ? { label: 'Letter sent', icon: 'outgoing_mail', access: 'orders.write & orders.perform' }
        : {
            label: 'Book visit',
            icon: 'event_available',
            access: 'orders.write | appointments.create',
          };
    }
    if (
      o.status === GenericStatus.InProgress &&
      (o.type !== ClinicalOrderType.Referral || o.referredToCompanyId)
    ) {
      return {
        label: o.type === ClinicalOrderType.Referral ? 'Reply received' : 'Record result',
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
      { label: 'Kind', value: this.enums.label('ClinicalOrderType', o.type) },
      { label: 'Ordered by', value: o.orderingDoctor?.fullName },
      { label: 'From visit', value: o.appointment?.code },
      {
        label: 'Treatment',
        value: o.treatment ? `${o.treatment.code} · ${o.treatment.title}` : null,
      },
      {
        label: 'Service',
        value: o.billableService
          ? `${o.billableService.name} · ${formatMoney(o.billableService.price)}`
          : null,
      },
      { label: 'Body part / sample', value: o.bodyPart },
      { label: 'Referred to', value: target },
      {
        label: 'Referred visit',
        value: o.referralAppointment
          ? `${o.referralAppointment.code} · ${o.referralAppointment.scheduledDate} ${o.referralAppointment.startTime}`
          : null,
      },
      { label: 'Room', value: o.room ? `${o.room.code} · ${o.room.name}` : null },
      { label: 'Performed by', value: o.performer?.fullName },
      { label: 'Reported by', value: o.reporter?.fullName },
      { label: 'Cancellation reason', value: o.cancellationReason },
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
      title: 'Cancel this order?',
      confirmLabel: 'Cancel order',
      danger: true,
    });
    if (!reason) return;
    this.detail.set(await firstValueFrom(this.api.cancel(this.id(), reason)));
    this.notify.success('Order cancelled.');
  };

  protected readonly open = async (file: Attachment): Promise<void> => {
    await firstValueFrom(this.files.download(file.id, true));
  };

  protected readonly archive = async (): Promise<void> => {
    await this.detail.archive();
    this.notify.success('Order archived.');
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.detail.unarchive();
    this.notify.success('Order back in lists.');
  };

  protected readonly restore = async (): Promise<void> => {
    await this.detail.restore();
    this.notify.success('Order restored.');
  };

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success('Order deleted.');
    await this.router.navigateByUrl('/clinic/clinical-orders');
  };
}

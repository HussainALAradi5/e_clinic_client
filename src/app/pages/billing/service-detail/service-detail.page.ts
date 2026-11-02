import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { ServiceFormDialog } from '@components/billing/service-form-dialog/service-form-dialog.component';
import { ServiceFormDialogData } from '@interfaces/billing/dialog-data.interface';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { EntityActions } from '@components/common/entity-actions/entity-actions.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { BillableService } from '@interfaces/billing/billable-service.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { BillableServiceApi } from '@services/billing/billable-service-api.service';
import { EntityDetail } from '@services/data/entity-detail';
import { EnumService } from '@services/data/enum.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { formatMoney } from '@utilities/money';
import { humanise } from '@utilities/text';

/** `/billing/service-catalog/:id` — price, posting, where it is used, history. */
@Component({
  selector: 'app-service-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    EntityActions,
    ErrorState,
    Skeleton,
    Facts,
    AuditHistory,
    MatCardModule,
    MatTabsModule,
    HasAccessDirective,
    EnumLabelPipe,
  ],
  templateUrl: './service-detail.page.html',
})
export class ServiceDetailPage implements OnInit {
  readonly id = input.required<string>();

  protected readonly detail = new EntityDetail(inject(BillableServiceApi));
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  private readonly enums = inject(EnumService);

  protected readonly label = humanise;
  protected readonly usage = computed(() =>
    Object.entries(this.detail.record()?.usage ?? {}).filter(([, n]) => n > 0),
  );
  protected readonly facts = computed<Fact[]>(() => {
    const s = this.detail.record();
    if (!s) return [];
    return [
      { label: 'Code', value: s.code, mono: true },
      { label: 'Category', value: this.enums.label('ServiceCategory', s.category) },
      { label: 'Price', value: formatMoney(s.price) },
      { label: 'VAT', value: `${+s.taxRate}%` },
      {
        label: 'Revenue account',
        value: s.revenueAccount ? `${s.revenueAccount.code} ${s.revenueAccount.name}` : null,
      },
      { label: 'Specialty', value: s.specialty?.name },
      { label: 'Insurable', value: s.isInsurable ? 'Yes' : 'No' },
      {
        label: 'Consent needed',
        value: s.consentType ? this.enums.label('ConsentType', s.consentType) : 'No',
      },
    ];
  });

  ngOnInit(): void {
    void this.detail.load(this.id());
  }

  protected readonly edit = async (): Promise<void> => {
    const saved = await this.dialogs.open<
      ServiceFormDialog,
      ServiceFormDialogData,
      BillableService
    >(
      ServiceFormDialog,
      { service: this.detail.record(), save: (payload) => this.detail.update(payload) },
      { width: '720px' },
    );
    if (saved) this.notify.success('Service saved.');
  };

  protected readonly archive = async (): Promise<void> => {
    await this.detail.archive();
    this.notify.success('Service archived — no longer offered.');
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.detail.unarchive();
    this.notify.success('Service offered again.');
  };

  protected readonly restore = async (): Promise<void> => {
    await this.detail.restore();
    this.notify.success('Service restored.');
  };

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success('Service deleted.');
    await this.router.navigateByUrl('/billing/service-catalog');
  };
}

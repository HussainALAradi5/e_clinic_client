import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { CompanyFormDialog } from '../../components/company-form-dialog/company-form-dialog.component';
import { CompanyFormDialogData } from '../../interfaces/dialog-data.interface';
import { CompanyStore } from '../../services/company.store';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { AuditHistory } from '@shared/components/audit-history/audit-history.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Company } from '@shared/interfaces/reference/company.interface';
import { ConfirmConfig } from '@shared/interfaces/ui/confirm-config.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { humanise } from '@shared/utils/text';
import { Flag } from '@shared/components/flag/flag.component';

/** `/reference/companies/:id` — contacts, address, where the company is used, history; edit / archive / delete. */
@Component({
  selector: 'app-company-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CompanyStore],
  imports: [
    Flag,
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    AuditHistory,
    MatCardModule,
    MatTabsModule,
    EnumLabelPipe,
  ],
  templateUrl: './company-detail.page.html',
})
export class CompanyDetailPage implements OnInit {
  /** Route parameter. */
  readonly id = input.required<string>();

  protected readonly store = inject(CompanyStore);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly variants = ButtonVariant;
  protected readonly label = humanise;
  protected readonly usage = computed(() => Object.entries(this.store.company()?.usage ?? {}));
  protected readonly inUse = computed(() => this.usage().some(([, count]) => count > 0));
  protected readonly deleteConfirm: ConfirmConfig = {
    title: 'Delete this company?',
    message: 'It can be restored later from the deleted companies list.',
    confirmLabel: 'Delete',
    danger: true,
  };

  ngOnInit(): void {
    void this.store.load(this.id());
  }

  protected readonly edit = async (): Promise<void> => {
    const saved = await this.dialogs.open<CompanyFormDialog, CompanyFormDialogData, Company>(
      CompanyFormDialog,
      { company: this.store.company(), save: (payload) => this.store.update(payload) },
      { width: '720px' },
    );
    if (saved) {
      this.notify.success('Company saved.');
    }
  };

  protected readonly archive = async (): Promise<void> => {
    await this.store.archive();
    this.notify.success('Company archived — hidden from pickers.');
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.store.unarchive();
    this.notify.success('Company restored to pickers.');
  };

  protected readonly restore = async (): Promise<void> => {
    await this.store.restore();
    this.notify.success('Company restored.');
  };

  protected readonly remove = async (): Promise<void> => {
    await this.store.remove();
    this.notify.success('Company deleted.');
    await this.router.navigateByUrl('/reference/companies');
  };
}

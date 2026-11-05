import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { CompanyFormDialog } from '@components/reference/company-form-dialog/company-form-dialog.component';
import { CompanyFormDialogData } from '@interfaces/reference/dialog-data.interface';
import { CompanyStore } from '@services/reference/company.store';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Company } from '@interfaces/reference/company.interface';
import { ConfirmConfig } from '@interfaces/ui/confirm-config.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { humanise } from '@utilities/text';
import { Flag } from '@components/common/flag/flag.component';
import { COMPANY_DETAIL_TEXT } from '@constants/reference/company-detail.constants';

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
  protected readonly text = COMPANY_DETAIL_TEXT;

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
    title: COMPANY_DETAIL_TEXT.deleteThisCompany,
    message: COMPANY_DETAIL_TEXT.itCanBeRestoredLater,
    confirmLabel: COMPANY_DETAIL_TEXT.delete,
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
      this.notify.success(COMPANY_DETAIL_TEXT.companySaved);
    }
  };

  protected readonly archive = async (): Promise<void> => {
    await this.store.archive();
    this.notify.success(COMPANY_DETAIL_TEXT.companyArchivedHiddenFromPickers);
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.store.unarchive();
    this.notify.success(COMPANY_DETAIL_TEXT.companyRestoredToPickers);
  };

  protected readonly restore = async (): Promise<void> => {
    await this.store.restore();
    this.notify.success(COMPANY_DETAIL_TEXT.companyRestored);
  };

  protected readonly remove = async (): Promise<void> => {
    await this.store.remove();
    this.notify.success(COMPANY_DETAIL_TEXT.companyDeleted);
    await this.router.navigateByUrl('/reference/companies');
  };
}

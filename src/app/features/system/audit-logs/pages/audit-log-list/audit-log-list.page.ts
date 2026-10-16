import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuditEntryDialog } from '../../components/audit-entry-dialog/audit-entry-dialog.component';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { DATE_FORMAT, TIME_FORMAT } from '@shared/constants/app.constants';
import { DateRangePreset } from '@shared/enums/shared/date-range-preset.enum';
import { AuditLog } from '@shared/interfaces/identity/audit-log.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { AuditLogApi } from '@shared/services/identity/audit-log-api.service';
import { TaskTracker } from '@shared/services/task/task-tracker.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { defaultQuery } from '@shared/utils/list-query';

/** `/system/audit-logs` — append-only trail; a date range (≤ 93 days) is always applied, newest first; CSV export. */
@Component({
  selector: 'app-audit-log-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, DatePipe, EnumLabelPipe],
  templateUrl: './audit-log-list.page.html',
})
export class AuditLogListPage {
  private readonly dialogs = inject(DialogService);
  private readonly api = inject(AuditLogApi);
  private readonly tracker = inject(TaskTracker);
  private readonly list = viewChild.required(ResourceListPage);

  protected readonly defaults = defaultQuery({ dateRange: DateRangePreset.Last7Days });
  protected readonly dateTimeFormat = `${DATE_FORMAT}, ${TIME_FORMAT}`;

  /** Exports what is on screen (same filters and period) as CSV in the background. */
  protected readonly export = async (): Promise<void> => {
    this.tracker.follow(await firstValueFrom(this.api.export(this.list().currentQuery())));
  };

  protected open(row: { id: string }): void {
    void this.dialogs.open<AuditEntryDialog, AuditLog, void>(AuditEntryDialog, row as AuditLog, {
      width: '640px',
    });
  }
}

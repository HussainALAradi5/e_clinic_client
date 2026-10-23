import { humanise } from '@shared/utils/text';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuditEntryDialog } from '../../components/audit-entry-dialog/audit-entry-dialog.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { DATE_FORMAT, TIME_FORMAT } from '@shared/constants/app.constants';
import { DateRangePreset } from '@shared/enums/shared/date-range-preset.enum';
import { AuditLog } from '@shared/interfaces/identity/audit-log.interface';
import { DialogService } from '@shared/services/ui/dialog.service';
import { defaultQuery } from '@shared/utils/list-query';

/** `/system/audit-logs` — append-only trail; a date range (≤ 93 days) is always applied, newest first; Export menu (Excel / PDF / CSV) from the list. */
@Component({
  selector: 'app-audit-log-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, DatePipe],
  templateUrl: './audit-log-list.page.html',
})
export class AuditLogListPage {
  /** Record types arrive as aliases (`clinical_order`); shown as words. */
  protected readonly humanise = humanise;
  private readonly dialogs = inject(DialogService);

  protected readonly defaults = defaultQuery({ dateRange: DateRangePreset.Last7Days });
  protected readonly dateTimeFormat = `${DATE_FORMAT}, ${TIME_FORMAT}`;

  protected open(row: { id: string }): void {
    void this.dialogs.open<AuditEntryDialog, AuditLog, void>(AuditEntryDialog, row as AuditLog, {
      width: '640px',
    });
  }
}

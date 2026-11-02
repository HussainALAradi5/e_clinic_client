import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EXPORT_FORMAT_OPTIONS } from '@constants/transfer.constants';
import { ExportFormat } from '@enums/list/export-format.enum';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { TaskTracker } from '@services/task/task-tracker.service';
import { NotifyService } from '@services/ui/notify.service';
import { ListSelection } from '@utilities/list-selection';
import { toExportFilter } from '@utilities/list-query';
import { TransferApi } from './transfer-api.service';

/**
 * Export flow of a list: the ticked rows (or "all matching"), otherwise everything matching the filters on screen,
 * in the visible columns. Small exports download at once; large ones are followed as a background task.
 */
@Injectable({ providedIn: 'root' })
export class TransferService {
  private readonly api = inject(TransferApi);
  private readonly notify = inject(NotifyService);
  private readonly tracker = inject(TaskTracker);

  async export(
    endpoint: string,
    format: ExportFormat,
    query: ListQuery,
    columns: string[],
    selection: ListSelection | null,
  ): Promise<void> {
    const target = selection?.hasSelection()
      ? selection.toExportTarget()
      : { filter: toExportFilter(query) };
    const outcome = await firstValueFrom(this.api.export(endpoint, { format, columns, ...target }));

    if (outcome.downloaded) {
      const label = EXPORT_FORMAT_OPTIONS.find((o) => o.format === format)?.label ?? format;
      this.notify.success(`${label.replace(/ \(.*\)/, '')} file downloaded.`);
    } else {
      this.tracker.follow(outcome.taskId);
    }
  }
}

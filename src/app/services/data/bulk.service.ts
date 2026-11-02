import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { BULK_SYNC_LIMIT, TYPE_TO_CONFIRM_THRESHOLD } from '@constants/limits.constants';
import { BulkActionRequest, BulkResult } from '@interfaces/bulk/bulk.interface';
import { BulkActionDef } from '@interfaces/list/resource-schema.interface';
import { ApiClient } from '@services/api/api-client.service';
import { TaskTracker } from '@services/task/task-tracker.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { ListSelection } from '@utilities/list-selection';
import { humanise } from '@utilities/text';

/**
 * Bulk flow: dry run → confirm dialog (counts, skipped, reason) → run → result toast with Undo (inverse action).
 * Mirror of BulkActionService; talks only to `POST /<endpoint>/bulk`.
 */
@Injectable({ providedIn: 'root' })
export class BulkService {
  private readonly api = inject(ApiClient);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly tracker = inject(TaskTracker);

  send(endpoint: string, request: BulkActionRequest): Observable<BulkResult> {
    return this.api.post<BulkResult>(`${endpoint}/bulk`, request);
  }

  /** Full interactive flow; resolves to the result, or null when the user cancels. */
  async execute(
    endpoint: string,
    action: BulkActionDef,
    selection: ListSelection,
  ): Promise<BulkResult | null> {
    const request = selection.toBulkRequest(action.name);
    const preview = await firstValueFrom(this.send(endpoint, { ...request, dryRun: true }));
    const label = humanise(action.name);
    const willChange = preview.succeeded;

    if (willChange === 0) {
      this.notify.error(
        `Nothing to ${label.toLowerCase()}: ${preview.failed[0]?.message ?? 'no record can be changed.'}`,
      );
      return null;
    }

    const notes = [
      preview.failed.length
        ? `${preview.failed.length} will be skipped: ${preview.failed[0].message}`
        : null,
      // The server runs large batches as a background task (same limit as BulkActionService).
      willChange > BULK_SYNC_LIMIT
        ? 'This runs in the background — you can keep working and get a message when it is done.'
        : null,
    ].filter((note): note is string => note !== null);
    const answer = await this.dialogs.ask({
      title: `${label} ${willChange} record${willChange === 1 ? '' : 's'}?`,
      message: notes.length ? notes.join(' ') : undefined,
      confirmLabel: label,
      danger: ['delete', 'cancel', 'reject', 'void'].includes(action.name),
      reason: action.needsReason,
      typeToConfirm: willChange > TYPE_TO_CONFIRM_THRESHOLD ? String(willChange) : undefined,
    });
    if (!answer.confirmed) {
      return null;
    }

    const result = await firstValueFrom(this.send(endpoint, { ...request, reason: answer.reason }));
    this.report(endpoint, label, result);
    return result;
  }

  private report(endpoint: string, label: string, result: BulkResult): void {
    if (result.queued) {
      if (result.taskId) {
        this.tracker.follow(result.taskId);
      } else {
        this.notify.info(`${label} is running in the background for ${result.requested} records.`);
      }
      return;
    }

    const skipped = result.failed.length ? `, ${result.failed.length} skipped` : '';
    const message = `${label}: ${result.succeeded} done${skipped}.`;
    const succeededIds = result.succeededIds;

    if (result.inverse && succeededIds.length) {
      this.notify.success(message, 'Undo', 10000).subscribe(() => {
        this.send(endpoint, { action: result.inverse!, ids: succeededIds }).subscribe({
          next: (undo) => this.notify.success(`Undone (${undo.succeeded}).`),
          error: (e: unknown) => this.notify.error(e),
        });
      });
      return;
    }
    this.notify.success(message);
  }
}

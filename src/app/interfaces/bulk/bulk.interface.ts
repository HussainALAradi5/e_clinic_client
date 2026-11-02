import { ListQuery } from '@interfaces/list/list-query.interface';

/** Mirror of BulkActionData: `ids` (≤ 500) or `filter` (select all matching) — never both. */
export interface BulkActionRequest {
  action: string;
  ids?: string[];
  filter?: ListQuery;
  reason?: string;
  dryRun?: boolean;
}

export interface BulkFailure {
  id: string;
  code: string;
  message: string;
}

/** Mirror of App\Shared\Bulk\BulkResult. */
export interface BulkResult {
  action: string;
  requested: number;
  succeeded: number;
  /** Changed records — used for Undo with the inverse action. */
  succeededIds: string[];
  failed: BulkFailure[];
  dryRun: boolean;
  queued: boolean;
  /** Background task (`bulk_action`) running a large action — track it on /system/background-tasks. */
  taskId: string | null;
  inverse: string | null;
}

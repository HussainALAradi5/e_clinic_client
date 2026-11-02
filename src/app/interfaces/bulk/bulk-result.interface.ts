import { BulkFailure } from '@interfaces/bulk/bulk-failure.interface';

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

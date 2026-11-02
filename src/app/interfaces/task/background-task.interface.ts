import { GenericStatus } from '@enums/shared/generic-status.enum';
import { TaskCancelReason } from '@enums/task/task-cancel-reason.enum';
import { TaskType } from '@enums/task/task-type.enum';
import { TaskRequester } from '@interfaces/task/task-requester.interface';

/** Mirror of BackgroundTaskResource. */
export interface BackgroundTask {
  id: string;
  type: TaskType;
  status: GenericStatus;
  /** 0–100 */
  progress: number;
  subjectType: string | null;
  subjectId: string | null;
  resultSummary: Record<string, unknown> | null;
  /** A result file can be downloaded (completed and not expired). */
  hasResult: boolean;
  cancelReason: TaskCancelReason | null;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  requestedBy?: TaskRequester | null;
}

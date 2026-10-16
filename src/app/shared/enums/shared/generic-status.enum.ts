/** Mirror of App\Shared\Enums\GenericStatus — lifecycle of simple processes. */
export enum GenericStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

/** Mirror of GenericStatus::transitions() (the server stays the authority; also served by /meta/enums). */
export const GENERIC_STATUS_TRANSITIONS: Readonly<Record<GenericStatus, readonly GenericStatus[]>> =
  {
    [GenericStatus.Pending]: [GenericStatus.InProgress, GenericStatus.Cancelled],
    [GenericStatus.InProgress]: [GenericStatus.Completed, GenericStatus.Cancelled],
    [GenericStatus.Completed]: [],
    [GenericStatus.Cancelled]: [],
  };

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

/** Still running (pending, in progress): the statuses that can still move on. */
export const OPEN_GENERIC_STATUSES: readonly GenericStatus[] = Object.values(GenericStatus).filter(
  (status) => GENERIC_STATUS_TRANSITIONS[status].length > 0,
);

export function isOpenGenericStatus(status: GenericStatus | null | undefined): boolean {
  return status != null && OPEN_GENERIC_STATUSES.includes(status);
}

export interface PollOptions<T> {
  /** First delay in ms; doubles after each poll up to maxInterval. */
  interval?: number;
  maxInterval?: number;
  /** Stop when this returns true (that value is still emitted). */
  until?: (value: T) => boolean;
}

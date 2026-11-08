/** One changed field of an activity entry; values are already masked by the server. */
export interface ActivityChange {
  field: string;
  label: string;
  old: unknown;
  new: unknown;
}

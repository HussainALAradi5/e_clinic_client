/** The file came back at once, or a background task (`list_export`) is preparing it. */
export type ExportOutcome =
  { downloaded: true } | { downloaded: false; taskId: string; rows: number };

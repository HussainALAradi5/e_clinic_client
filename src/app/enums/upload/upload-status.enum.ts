/** State of one file in an UploadZone queue. */
export enum UploadStatus {
  Queued = 'queued',
  Uploading = 'uploading',
  Paused = 'paused',
  Done = 'done',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

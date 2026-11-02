import { GenericStatus } from '@enums/shared/generic-status.enum';

/** Resumable upload session (POST /attachments/uploads). */
export interface UploadSession {
  id: string;
  sizeBytes: number;
  chunkSize: number;
  receivedBytes: number;
  status: GenericStatus;
  attachmentId?: string;
}

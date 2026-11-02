import { AttachmentCategory } from '@enums/attachment/attachment-category.enum';
import { FileScanStatus } from '@enums/attachment/file-scan-status.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';

/** Attachment (Identity › Attachments) — used by the shared UploadZone. */
export interface Attachment extends GenericEntity {
  attachableType: string;
  attachableId: string;
  category: AttachmentCategory;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  scanStatus: FileScanStatus;
  isSensitive: boolean;
  description?: string;
}

/** Record the files belong to. */
export interface AttachmentOwner {
  type: string;
  id: string;
}

/** POST /attachments: 201 all saved, 207 partial, 422 none. */
export interface UploadResult {
  saved: Attachment[];
  failed: { index: number; name: string; code: string; message: string }[];
}

/** Resumable upload session (POST /attachments/uploads). */
export interface UploadSession {
  id: string;
  sizeBytes: number;
  chunkSize: number;
  receivedBytes: number;
  status: GenericStatus;
  attachmentId?: string;
}

import { AttachmentCategory } from '@enums/attachment/attachment-category.enum';
import { FileScanStatus } from '@enums/attachment/file-scan-status.enum';
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

import { AttachmentCategory } from '@shared/enums/attachment/attachment-category.enum';
import { UploadStatus } from '@shared/enums/upload/upload-status.enum';
import { Attachment, AttachmentOwner } from '@shared/interfaces/attachment/attachment.interface';

export interface UploadItem {
  key: string;
  file: File;
  status: UploadStatus;
  /** 0–100 */
  progress: number;
  resumable: boolean;
  error?: string;
  attachment?: Attachment;
  sessionId?: string;
}

export interface UploadQueueOptions {
  category: AttachmentCategory | `${AttachmentCategory}`;
  owner: AttachmentOwner;
  /** Called for every file that finished uploading. */
  onUploaded?: (attachment: Attachment) => void;
  /** MIME types / extensions, e.g. 'image/*,.pdf' (from the category rules). */
  accept?: string;
  maxFiles?: number;
  maxFileBytes?: number;
}

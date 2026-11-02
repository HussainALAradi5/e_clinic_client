import { UploadStatus } from '@enums/upload/upload-status.enum';
import { Attachment } from '@interfaces/attachment/attachment.interface';

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

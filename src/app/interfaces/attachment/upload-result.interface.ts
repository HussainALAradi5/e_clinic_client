import { Attachment } from '@interfaces/attachment/attachment.interface';

/** POST /attachments: 201 all saved, 207 partial, 422 none. */
export interface UploadResult {
  saved: Attachment[];
  failed: { index: number; name: string; code: string; message: string }[];
}

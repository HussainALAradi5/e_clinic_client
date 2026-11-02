import { AttachmentCategory } from '@enums/attachment/attachment-category.enum';
import { Attachment } from '@interfaces/attachment/attachment.interface';
import { AttachmentOwner } from '@interfaces/attachment/attachment-owner.interface';

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

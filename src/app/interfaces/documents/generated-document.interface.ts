import { DocumentType } from '@enums/documents/document-type.enum';

/** A record's current PDF (GeneratedDocumentResource): its DOC code, unique file name and size. */
export interface GeneratedDocument {
  id: string;
  code: string;
  type: DocumentType;
  recordId: string;
  reference: string;
  fileName: string;
  sizeBytes: number;
  createdAt: string;
  openPath: string;
  downloadPath: string;
}

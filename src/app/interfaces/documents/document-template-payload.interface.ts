import { WrittenDocumentKind } from '@enums/documents/written-document-kind.enum';

/** POST / PUT /document-templates — a template written from scratch or changed. */
export interface DocumentTemplatePayload {
  name: string;
  description: string | null;
  kind: WrittenDocumentKind;
  body: string;
}

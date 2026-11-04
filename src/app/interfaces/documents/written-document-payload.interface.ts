import { WrittenDocumentKind } from '@enums/documents/written-document-kind.enum';

/** POST /appointments/{id}/written-documents — the document written at the visit. */
export interface WrittenDocumentPayload {
  kind: WrittenDocumentKind;
  title: string;
  body: string;
  templateId: string | null;
}

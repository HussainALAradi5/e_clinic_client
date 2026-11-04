import { WrittenDocumentKind } from '@enums/documents/written-document-kind.enum';

/** A document written at a visit (WrittenDocumentResource); its PDF is DocumentType.WrittenDocument. */
export interface WrittenDocument {
  id: string;
  code: string;
  kind: WrittenDocumentKind;
  title: string;
  body: string;
  appointmentId: string;
  templateId: string | null;
  patient: { id: string; fullName: string; code: string };
  author: { id: string; fullName: string; jobTitle: string };
  issuedAt: string;
}

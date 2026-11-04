import { WrittenDocumentKind } from '@enums/documents/written-document-kind.enum';

/** A document template (DocumentTemplateResource): ready-made (`isSystem`, read-only) or the user's own. */
export interface DocumentTemplate {
  id: string;
  code: string;
  name: string;
  description: string | null;
  kind: WrittenDocumentKind;
  /** Rich text (HTML) with `{{placeholders}}`. */
  body: string;
  isSystem: boolean;
  isActive: boolean;
  isEditable: boolean;
  updatedAt: string | null;
}

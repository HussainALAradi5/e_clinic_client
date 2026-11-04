import { DocumentTemplate } from '@interfaces/documents/document-template.interface';
import { TemplatePlaceholder } from '@interfaces/documents/template-placeholder.interface';

/** Opens the template dialog: a new template (null) or one of the user's own to change. */
export interface TemplateDialogData {
  template: DocumentTemplate | null;
  placeholders: TemplatePlaceholder[];
}

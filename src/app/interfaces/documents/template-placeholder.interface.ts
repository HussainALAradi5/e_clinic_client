/** A field a template can name (`{{patient_name}}`), offered in the editor's "Insert field" menu. */
export interface TemplatePlaceholder {
  key: string;
  token: string;
  label: string;
}

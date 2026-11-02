/** Pages with editable forms implement this; GenericForm provides it for its form. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/** Opens the time picker: the field's label, its current "HH:mm" value, and whether it may be cleared. */
export interface TimePickerDialogData {
  label: string;
  value: string | null;
  clearable: boolean;
}

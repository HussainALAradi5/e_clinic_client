/** Correct one day of an employee (preset employee / date when opened from a row). */
export interface ManualAttendanceDialogData {
  employee: { id: string; fullName: string } | null;
  date: string | null;
}

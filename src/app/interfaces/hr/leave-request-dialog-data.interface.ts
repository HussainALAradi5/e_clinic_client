/** Leave for the signed-in employee, or (HR) for the given one — e.g. recording leave already taken. */
export interface LeaveRequestDialogData {
  employee: { id: string; fullName: string } | null;
}

/** Sick leave limits (same as the server's SickLeaveService) and the dialog's quick day choices. */
export const SICK_LEAVE_MAX_DAYS = 30;

export const SICK_LEAVE_DAY_CHOICES = [1, 2, 3, 5, 7, 14] as const;

/** Text of clinic/sick-leave-dialog/sick-leave-dialog.component. */
export const SICK_LEAVE_DIALOG_TEXT = {
  title: (patient: string) => `Sick leave for ${patient}`,
  daysOff: 'Days off',
  days: (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`,
  firstDay: 'First day',
  lastDay: 'Last day',
  limits: (max: number) => `Up to ${max} days, from the visit day or up to 3 days before.`,
  reason: 'Reason',
  reasonHint: 'Kept in the file',
  showReason: 'Print the reason on the certificate (the patient agrees)',
  notes: 'Case description',
  notesHint: 'Printed on the certificate, e.g. light duties after',
  submit: 'Issue sick leave',
};

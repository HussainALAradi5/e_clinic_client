/** Text of one staff request card (hr/staff-request-card). */
export const STAFF_REQUEST_CARD_TEXT = {
  you: 'you',
  day: 'Day',
  lateBy: 'Late by',
  overtime: 'Overtime',
  inOut: 'In – out',
  none: '—',
  noReason: 'No reason given.',
  approved: 'Approved',
  rejected: 'Rejected',
  by: (name: string | undefined) => `by ${name ?? 'HR'} ·`,
  reject: 'Reject',
  approve: 'Approve',
  withdraw: 'Withdraw',
};

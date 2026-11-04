/** Text of the fees page, the waive step and the cancel-dialog warning. */
export const FEE_TEXT = {
  title: 'Visit fees',
  subtitle:
    'Missed appointments and late cancellations by the patient, charged from the price list. Admins and accountants waive them while the invoice is a draft.',
  empty: 'No fees',
  waive: 'Waive',
  waived: 'Waived',
  draft: 'Draft',
  waiveTitle: (code: string, amount: string) => `Waive ${code} (${amount})?`,
  waiveMessage:
    "It comes off the patient's draft invoice. Your name and reason stay on the record.",
  waiveReason: 'Reason (at least 10 characters)',
  waivedDone: (code: string) => `Fee ${code} waived.`,
  cancelWarning: (amount: string) =>
    `Cancelling this close to the visit costs the patient ${amount} (late cancellation). It is not charged when the clinic or the doctor cancels.`,
};

/** Shortest waiver reason the server accepts. */
export const FEE_WAIVE_REASON_MIN = 10;

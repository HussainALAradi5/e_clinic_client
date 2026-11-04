/** Text of payment reminders on the invoice page. */
export const REMINDER_TEXT = {
  send: 'Send reminder',
  title: (patient: string) => `Remind ${patient} to pay?`,
  message:
    "They get a message with what is left for them to pay (never the insurer's share) and a link to pay online. Reminders also go out on their own: 3 days after issue, then weekly, at most 3.",
  sent: 'Reminder sent.',
  count: (n: number) => (n === 1 ? '1 reminder sent' : `${n} reminders sent`),
};

/** Contact search in the chat dialogs: page size, typing delay and wording. */
export const CONTACT_SEARCH = {
  pageSize: 20,
  debounceMs: 250,
  label: 'Find a colleague',
  hint: 'Name, phone, email or staff number',
  more: 'Show more',
  none: 'No one in the clinic matches.',
  count: (shown: number, total: number) => `${shown} of ${total}`,
};

/** Text of packages: the catalog, selling one and the patient's packages. */
export const PACKAGE_TEXT = {
  title: 'Packages',
  subtitle:
    'Prepaid sessions of one service. Sold on the patient\'s invoice, active once paid; each visit then uses a session instead of being billed.',
  empty: 'No packages yet',
  create: 'New package',
  edit: 'Edit',
  editTitle: 'Edit package',
  createTitle: 'New package',
  name: 'Name',
  description: 'Description (optional)',
  service: 'Covers the service',
  sessions: 'Sessions',
  price: 'Price',
  validity: 'Valid for (days after payment)',
  onSale: 'On sale',
  save: 'Save package',
  saved: (code: string) => `Package ${code} saved.`,
  perSession: (amount: string) => `${amount} per session`,
  patientTitle: 'Packages',
  sell: 'Sell package',
  sellTitle: 'Sell a package',
  sellHint: 'It goes on the patient\'s draft invoice and becomes active once that invoice is paid.',
  sold: (name: string) => `${name} added to the invoice — it activates once paid.`,
  none: 'No packages.',
  sessionsLeft: (left: number, total: number) => `${left} of ${total} sessions left`,
  validUntil: (date: string) => `Valid until ${date}`,
  onSaleYes: 'Yes',
  onSaleNo: 'No',
};

/** Limits the server applies to a package's terms. */
export const PACKAGE_LIMITS = { minSessions: 2, maxSessions: 100, minDays: 7, maxDays: 730 };

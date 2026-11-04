import { CommissionType } from '@enums/hr/commission-type.enum';

/** Text of doctor earnings (HR page, terms dialog, the doctor's own card). */
export const EARNINGS_TEXT = {
  title: 'Doctor earnings',
  subtitle:
    "Each doctor's share of what their work brought this month — from the ledger (cancellations and returns taken off, package sessions included). It goes on the payslip as Commission.",
  doctor: 'Doctor',
  terms: 'Terms',
  revenue: 'Revenue',
  visits: 'Visits',
  commission: 'Commission',
  edit: 'Terms',
  none: 'No doctors.',
  total: 'Total',
  dialogTitle: (name: string) => `Commission for ${name}`,
  type: 'Commission',
  percent: 'Percent of revenue',
  perVisit: 'BHD per completed visit',
  save: 'Save terms',
  saved: 'Commission terms saved.',
  myTitle: 'My earnings this month',
  myHint: 'Commission so far; the final amount is on your payslip.',
  termsLabel: (type: CommissionType, rate: string) =>
    type === CommissionType.Percent
      ? `${Number(rate)} %`
      : type === CommissionType.PerVisit
        ? `${rate} / visit`
        : '—',
};

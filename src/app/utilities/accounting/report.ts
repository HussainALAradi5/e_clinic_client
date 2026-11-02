import { ReportType } from '@enums/accounting/report-type.enum';
import { ReportRow } from '@interfaces/accounting/report.interface';
import { toCamel } from '@utilities/case';
import { ReportDefinition, ReportInputs } from '@interfaces/accounting/report.interface';

/** The report catalog, in the order an accountant reaches for them. */
export const REPORTS: readonly ReportDefinition[] = [
  {
    type: ReportType.IncomeStatement,
    label: 'Income statement',
    description: 'Revenue, expenses and profit for a period; compare with another period.',
    icon: 'trending_up',
    inputs: 'income',
  },
  {
    type: ReportType.BalanceSheet,
    label: 'Balance sheet',
    description: 'What the clinic owns and owes on a date.',
    icon: 'balance',
    inputs: 'as-of',
  },
  {
    type: ReportType.CashFlow,
    label: 'Cash flow',
    description: 'Money in and out of cash and bank accounts.',
    icon: 'waterfall_chart',
    inputs: 'range',
  },
  {
    type: ReportType.TrialBalance,
    label: 'Trial balance',
    description: 'Debit and credit balance of every account on a date.',
    icon: 'table_chart',
    inputs: 'as-of',
  },
  {
    type: ReportType.GeneralLedger,
    label: 'General ledger',
    description: 'Every posting of one account with the running balance.',
    icon: 'menu_book',
    inputs: 'ledger',
  },
  {
    type: ReportType.RevenueByDoctor,
    label: 'Revenue by doctor',
    description: "Each doctor's net revenue and share.",
    icon: 'stethoscope',
    inputs: 'range',
  },
  {
    type: ReportType.RevenueByService,
    label: 'Revenue by service',
    description: 'What sold, how often and for how much.',
    icon: 'sell',
    inputs: 'range',
  },
  {
    type: ReportType.ReceivablesAging,
    label: 'Receivables aging',
    description: 'Unpaid patient balances by age (0–30, 31–60, 61–90, 90+ days).',
    icon: 'hourglass_bottom',
    inputs: 'as-of',
  },
];

/** A cell of a report row (row keys arrive camelCased by the case interceptor; column keys stay snake_case). */
export function reportCell(row: ReportRow | Record<string, string>, key: string): string {
  const value = row[toCamel(key)];
  return value === null || value === undefined ? '' : String(value);
}

/** `line` | `group` | `total`. */
export function reportKind(row: ReportRow): string {
  return String(row[toCamel('_kind')] ?? 'line');
}

/** Router link of a row's `_link` (journal entry, account ledger, patient, doctor), or null. */
export function reportLink(row: ReportRow): string[] | null {
  const link = row[toCamel('_link')] as { type?: string; id?: string } | undefined;
  if (!link?.id) return null;
  switch (link.type) {
    case 'journal':
      return ['/accounting/journal', link.id];
    case 'account':
      return ['/accounting/chart-of-accounts', link.id];
    case 'patient':
      return ['/clinic/patients', link.id];
    case 'doctor':
      return ['/clinic/doctors', link.id];
    default:
      return null;
  }
}

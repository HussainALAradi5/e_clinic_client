import { StatusTone } from '@enums/ui/status-tone.enum';
import { InvoiceProgressSource } from '@interfaces/billing/invoice-progress-source.interface';
import { toMinor } from '@utilities/money';

/** Share of the invoice already paid, 0–100 (exact, in fils). */
export function paidPercent(invoice: InvoiceProgressSource): number {
  const total = toMinor(invoice.total.amount) ?? 0n;
  if (total <= 0n) return 100;
  const due = toMinor(invoice.balanceDue.amount) ?? 0n;
  const paid = total - (due < 0n ? 0n : due);
  return Number((paid * 100n) / total);
}

/** Colour of the payment bar: nothing paid amber, part paid blue, settled green. */
export function paidTone(percent: number): StatusTone {
  if (percent >= 100) return StatusTone.Green;
  return percent > 0 ? StatusTone.Blue : StatusTone.Amber;
}

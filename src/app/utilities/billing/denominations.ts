import { Denomination } from '@interfaces/finance/cash-session.interface';
import { fromMinor, toMinor } from '@utilities/money';

/** Bahraini notes and coins, largest first (face value in BHD, 3 decimals). */
export const BHD_DENOMINATIONS: readonly { value: string; label: string; coin: boolean }[] = [
  { value: '20.000', label: '20 BD', coin: false },
  { value: '10.000', label: '10 BD', coin: false },
  { value: '5.000', label: '5 BD', coin: false },
  { value: '1.000', label: '1 BD', coin: false },
  { value: '0.500', label: '500 fils', coin: false },
  { value: '0.100', label: '100 fils', coin: true },
  { value: '0.050', label: '50 fils', coin: true },
  { value: '0.025', label: '25 fils', coin: true },
  { value: '0.010', label: '10 fils', coin: true },
  { value: '0.005', label: '5 fils', coin: true },
];

/** Total of a note / coin count, as a 3-decimal amount. */
export function countTotal(counts: Denomination[]): string {
  const total = counts.reduce(
    (sum, d) => sum + (toMinor(d.value) ?? 0n) * BigInt(Math.max(0, Math.trunc(d.count || 0))),
    0n,
  );
  return fromMinor(total);
}

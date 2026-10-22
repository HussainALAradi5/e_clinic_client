import { Pipe, PipeTransform } from '@angular/core';
import { Money } from '@shared/interfaces/common/money.interface';
import { formatAmount, formatMoney } from '@shared/utils/money';

/** `{{ invoice.total | money }}` → 'BHD 25.500'; a bare amount string is in the clinic currency. */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(value: Money | string | null | undefined): string {
    return typeof value === 'string' ? formatAmount(value) : formatMoney(value);
  }
}

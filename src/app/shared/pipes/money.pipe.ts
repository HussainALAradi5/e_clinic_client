import { Pipe, PipeTransform } from '@angular/core';
import { Money } from '@shared/interfaces/common/money.interface';
import { formatMoney } from '@shared/utils/money';

/** `{{ invoice.total | money }}` → 'BHD 25.500'. */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(value: Money | null | undefined): string {
    return formatMoney(value);
  }
}

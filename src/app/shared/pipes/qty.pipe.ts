import { Pipe, PipeTransform } from '@angular/core';
import { formatQty } from '@shared/utils/quantity';

/** `{{ item.quantity | qty }}` → '21' / '2.5' (stock quantities without trailing zeros). */
@Pipe({ name: 'qty' })
export class QtyPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatQty(value);
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { CLINIC_LOCALE } from '@constants/app.constants';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];
const formatter = new Intl.RelativeTimeFormat(CLINIC_LOCALE, { numeric: 'auto' });

/** ISO timestamp → '5 minutes ago' / 'in 2 days'. */
@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | null | undefined, now: number = Date.now()): string {
    if (!value) {
      return '';
    }
    const seconds = Math.round((new Date(value).getTime() - now) / 1000);
    const [unit, size] = UNITS.find(([, s]) => Math.abs(seconds) >= s) ?? ['second', 1];
    return formatter.format(Math.round(seconds / size), unit);
  }
}

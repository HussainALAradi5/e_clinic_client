import { Pipe, PipeTransform } from '@angular/core';

/** Minutes → '1 h 30 min' / '45 min'. */
@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(minutes: number | null | undefined): string {
    if (minutes === null || minutes === undefined) {
      return '';
    }
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return [h ? `${h} h` : '', m || !h ? `${m} min` : ''].filter(Boolean).join(' ');
  }
}

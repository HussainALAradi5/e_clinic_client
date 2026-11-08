import { Pipe, PipeTransform } from '@angular/core';
import { wallClock } from '@utilities/clock-format';

/** `{{ visit.startTime | clock }}`: a wall-clock time in the signed-in person's 12 or 24-hour format. */
@Pipe({ name: 'clock' })
export class ClockPipe implements PipeTransform {
  transform(time: string | null | undefined): string {
    return wallClock(time);
  }
}

import { Pipe, PipeTransform } from '@angular/core';

/** `{{ cpr | mask }}` → '******1234' (same rule as the server mask() helper). */
@Pipe({ name: 'mask' })
export class MaskPipe implements PipeTransform {
  transform(value: string | null | undefined, visible = 4): string {
    if (!value) {
      return '';
    }
    return value.length <= visible
      ? '*'.repeat(value.length)
      : '*'.repeat(value.length - visible) + value.slice(-visible);
  }
}

import { inject, Pipe, PipeTransform } from '@angular/core';
import { EnumService } from '@services/data/enum.service';

/** `{{ row.status | enumLabel: 'AppointmentStatus' }}` — labels from GET /meta/enums (never hard-coded). */
@Pipe({ name: 'enumLabel', pure: false })
export class EnumLabelPipe implements PipeTransform {
  private readonly enums = inject(EnumService);

  transform(value: string | number | null | undefined, enumName: string): string {
    return this.enums.label(enumName, value);
  }
}

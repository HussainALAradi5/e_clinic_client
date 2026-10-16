import { Pipe, PipeTransform } from '@angular/core';
import { ageInYears } from '@shared/utils/clinic-time';

/** `{{ patient.dateOfBirth | age }}` → '34 y'. */
@Pipe({ name: 'age' })
export class AgePipe implements PipeTransform {
  transform(dateOfBirth: string | null | undefined): string {
    return dateOfBirth ? `${ageInYears(dateOfBirth)} y` : '';
  }
}

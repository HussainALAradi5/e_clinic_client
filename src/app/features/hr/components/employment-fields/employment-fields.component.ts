import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { EmploymentForm } from '../../utils/employment-form';
import { EntitySelect } from '@shared/components/entity-select/entity-select.component';
import { MoneyInput } from '@shared/components/money-input/money-input.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { Department, DepartmentRef } from '@shared/interfaces/hr/department.interface';
import { EnumService } from '@shared/services/data/enum.service';

/** Employment fields shared by the hire and edit dialogs; salary fields only when `salary` is true. */
@Component({
  selector: 'app-employment-fields',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextField, SelectField, MoneyInput, EntitySelect],
  host: { class: 'block' },
  templateUrl: './employment-fields.component.html',
})
export class EmploymentFields {
  readonly form = input.required<EmploymentForm>();
  readonly salary = input(true);
  readonly department = input<DepartmentRef | null>(null);
  /** Stored IBAN (masked) shown as a hint while editing. */
  readonly storedIban = input<string | null>(null);

  protected readonly days = inject(EnumService).options('DayOfWeek');
  protected readonly departmentName = (d: Department): string => d.name;
}

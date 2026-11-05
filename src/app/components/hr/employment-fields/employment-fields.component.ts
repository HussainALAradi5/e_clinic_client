import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { EmploymentForm } from '@interfaces/hr/employment-form.interface';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { MoneyInput } from '@components/common/money-input/money-input.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { Department } from '@interfaces/hr/department.interface';
import { DepartmentRef } from '@interfaces/hr/department-ref.interface';
import { EnumService } from '@services/data/enum.service';
import { EMPLOYMENT_FIELDS_TEXT } from '@constants/hr/employment-fields.constants';

/** Employment fields shared by the hire and edit dialogs; salary fields only when `salary` is true. */
@Component({
  selector: 'app-employment-fields',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextField, SelectField, MoneyInput, EntitySelect],
  host: { class: 'block' },
  templateUrl: './employment-fields.component.html',
})
export class EmploymentFields {
  protected readonly text = EMPLOYMENT_FIELDS_TEXT;

  readonly form = input.required<EmploymentForm>();
  readonly salary = input(true);
  readonly department = input<DepartmentRef | null>(null);
  /** Stored IBAN (masked) shown as a hint while editing. */
  readonly storedIban = input<string | null>(null);

  protected readonly days = inject(EnumService).options('DayOfWeek');
  protected readonly departmentName = (d: Department): string => d.name;
}

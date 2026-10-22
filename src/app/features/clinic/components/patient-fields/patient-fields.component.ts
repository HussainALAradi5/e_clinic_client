import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PatientForm } from '../../utils/patient-form';
import { EntitySelect } from '@shared/components/entity-select/entity-select.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { CompanyType } from '@shared/enums/reference/company-type.enum';
import { FilterGroup } from '@shared/interfaces/list/list-query.interface';
import { Company } from '@shared/interfaces/reference/company.interface';

/** Patient-file fields (registration and edit): medical alerts, emergency contact, insurance. */
@Component({
  selector: 'app-patient-fields',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextField, SelectField, EntitySelect],
  host: { class: 'block' },
  templateUrl: './patient-fields.component.html',
})
export class PatientFields {
  readonly form = input.required<PatientForm>();
  readonly insurer = input<{ id: string; name: string } | null>(null);

  protected readonly insurers: FilterGroup = { and: [{ type: { eq: CompanyType.Insurer } }] };
  protected readonly companyName = (c: Company): string => c.name;
}

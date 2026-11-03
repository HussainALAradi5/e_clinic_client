import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PatientForm } from '@interfaces/clinic/patient-form.interface';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { CompanyType } from '@enums/reference/company-type.enum';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { Company } from '@interfaces/reference/company.interface';
import { EmergencyContactsField } from '@components/clinic/emergency-contacts-field/emergency-contacts-field.component';

/** Patient-file fields (registration and edit): medical alerts, emergency contact, insurance. */
@Component({
  selector: 'app-patient-fields',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextField, SelectField, EntitySelect, EmergencyContactsField],
  host: { class: 'block' },
  templateUrl: './patient-fields.component.html',
})
export class PatientFields {
  readonly form = input.required<PatientForm>();
  readonly insurer = input<{ id: string; name: string } | null>(null);

  protected readonly insurers: FilterGroup = { and: [{ type: { eq: CompanyType.Insurer } }] };
  protected readonly companyName = (c: Company): string => c.name;
}

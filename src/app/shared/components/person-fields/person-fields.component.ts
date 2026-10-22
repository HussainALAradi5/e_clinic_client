import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CountrySelect } from '@shared/components/country-select/country-select.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { NewPersonForm } from '@shared/utils/person';

/** Personal data fields of a new person (patient registration, hire) — one layout everywhere. */
@Component({
  selector: 'ui-person-fields',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextField, SelectField, CountrySelect],
  host: { class: 'block' },
  templateUrl: './person-fields.component.html',
})
export class PersonFields {
  readonly form = input.required<NewPersonForm>();
}

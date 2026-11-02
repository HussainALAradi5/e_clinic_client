import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CountrySelect } from '@components/common/country-select/country-select.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { NewPersonForm } from '@interfaces/common/person.interface';

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

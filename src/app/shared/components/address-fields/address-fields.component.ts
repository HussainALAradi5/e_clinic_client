import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { startWith } from 'rxjs';
import { CountrySelect } from '@shared/components/country-select/country-select.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { AddressForm, BAHRAIN } from '@shared/utils/address';

/**
 * Shared address editor: Bahrain format (flat / building / road / block / area) or international
 * (line 1–2, city, postal code, governorate), switched by the country. Build the form with addressForm().
 */
@Component({
  selector: 'ui-address-fields',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CountrySelect, TextField],
  host: { class: 'block' },
  templateUrl: './address-fields.component.html',
})
export class AddressFields {
  readonly form = input.required<AddressForm>();

  private readonly country = signal(BAHRAIN);
  protected readonly bahrain = computed(() => this.country() === BAHRAIN);

  constructor() {
    effect((onCleanup) => {
      const control = this.form().controls.countryCode;
      const sub = control.valueChanges
        .pipe(startWith(control.value))
        .subscribe((code) => this.country.set(code ?? BAHRAIN));
      onCleanup(() => sub.unsubscribe());
    });
  }
}

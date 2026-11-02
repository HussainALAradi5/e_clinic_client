import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AddressPayload } from '@interfaces/reference/address.interface';
import { AddressForm } from '@interfaces/common/address.interface';

export const BAHRAIN = 'BH';

/** Fields the server requires per country (others: line 1 or city). Mirror of AddressService. */
const REQUIRED: Record<string, (keyof AddressPayload)[]> = {
  [BAHRAIN]: ['building', 'road', 'block'],
};

const text = (value: string | null | undefined, max: number): FormControl<string | null> =>
  new FormControl(value ?? null, [Validators.maxLength(max)]);

/** Reactive form of the shared address; required fields follow the selected country. */
export function addressForm(address: AddressPayload | null = null): AddressForm {
  const form: AddressForm = new FormGroup({
    countryCode: new FormControl(address?.countryCode ?? BAHRAIN, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    flat: text(address?.flat, 20),
    building: text(address?.building, 20),
    road: text(address?.road, 20),
    block: text(address?.block, 10),
    area: text(address?.area, 100),
    city: text(address?.city, 100),
    governorate: text(address?.governorate, 100),
    postalCode: text(address?.postalCode, 20),
    line1: text(address?.line1, 255),
    line2: text(address?.line2, 255),
  });
  const applyCountry = (code: string): void => {
    const required = REQUIRED[code] ?? ['line1'];
    for (const [key, control] of Object.entries(form.controls)) {
      if (key === 'countryCode') {
        continue;
      }
      control.setValidators([
        Validators.maxLength(key === 'block' ? 10 : key.startsWith('line') ? 255 : 100),
        ...(required.includes(key as keyof AddressPayload) ? [Validators.required] : []),
      ]);
      control.updateValueAndValidity({ emitEvent: false });
    }
  };
  applyCountry(form.controls.countryCode.value);
  form.controls.countryCode.valueChanges.subscribe(applyCountry);
  return form;
}

/** Form value → payload (trimmed; empty → null), or null when nothing but the country was entered. */
export function toAddressPayload(form: AddressForm): AddressPayload | null {
  const value = form.getRawValue();
  const entries = Object.entries(value).map(([k, v]) => [
    k,
    typeof v === 'string' ? v.trim() || null : v,
  ]);
  const payload = Object.fromEntries(entries) as unknown as AddressPayload;
  const filled = entries.some(([k, v]) => k !== 'countryCode' && v !== null);
  return filled ? payload : null;
}

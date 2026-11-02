import { addressForm, toAddressPayload } from '@utilities/address';

describe('address form', () => {
  it('requires building, road and block in Bahrain and line 1 elsewhere', () => {
    const form = addressForm();
    expect(form.controls.block.hasError('required')).toBe(true);
    expect(form.controls.line1.hasError('required')).toBe(false);

    form.controls.countryCode.setValue('DE');
    expect(form.controls.block.hasError('required')).toBe(false);
    expect(form.controls.line1.hasError('required')).toBe(true);
  });

  it('builds a trimmed payload, or null when empty', () => {
    const form = addressForm();
    expect(toAddressPayload(form)).toBeNull();

    form.patchValue({ building: ' 2504 ', road: '2832', block: '428', area: '' });
    expect(toAddressPayload(form)).toMatchObject({
      countryCode: 'BH',
      building: '2504',
      area: null,
    });
  });
});

import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { applyServerErrors } from '@utilities/server-errors';
import { ApiError } from '@interfaces/api/api-error.interface';

describe('applyServerErrors', () => {
  it('maps snake_case dotted keys to controls and returns the rest', () => {
    const form = new FormGroup({
      firstName: new FormControl(''),
      items: new FormArray([new FormGroup({ unitPrice: new FormControl('') })]),
    });
    const error: ApiError = {
      status: 422,
      code: 'VALIDATION_FAILED',
      message: 'Invalid',
      meta: null,
      requestId: null,
      errors: {
        first_name: ['Required.'],
        'items.0.unit_price': ['Too low.'],
        other: ['General problem.'],
      },
    };

    const unmatched = applyServerErrors(form, error);

    expect(form.get('firstName')?.errors).toEqual({ server: 'Required.' });
    expect(form.get(['items', 0, 'unitPrice'])?.errors).toEqual({ server: 'Too low.' });
    expect(unmatched).toEqual(['General problem.']);
  });
});

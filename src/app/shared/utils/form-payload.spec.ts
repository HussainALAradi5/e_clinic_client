import { FormControl, FormGroup } from '@angular/forms';
import { dirtyPayload } from './form-payload';

describe('dirtyPayload', () => {
  const form = (): FormGroup =>
    new FormGroup({
      name: new FormControl(' Room 1 '),
      floor: new FormControl(''),
      capacity: new FormControl(2),
    });

  it('sends every field on create, trimmed, blank as null, minus skipped ones', () => {
    expect(dirtyPayload(form(), ['capacity'], true)).toEqual({ name: 'Room 1', floor: null });
  });

  it('sends only changed fields on edit', () => {
    const f = form();
    f.controls['capacity'].setValue(4);
    f.controls['capacity'].markAsDirty();
    expect(dirtyPayload(f)).toEqual({ capacity: 4 });
  });
});

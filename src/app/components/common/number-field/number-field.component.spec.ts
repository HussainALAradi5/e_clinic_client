import { TestBed } from '@angular/core/testing';
import { NumberField } from '@components/common/number-field/number-field.component';

interface Settling {
  field(): { setValue(value: string | null): void; value: string | null };
  settle(): void;
}

function setup(value: string | number | null) {
  const fixture = TestBed.createComponent(NumberField);
  fixture.componentRef.setInput('label', 'Amount');
  fixture.componentRef.setInput('value', value);
  fixture.detectChanges();
  const emitted: (string | null)[] = [];
  fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));
  return { fixture, emitted, field: fixture.componentInstance as unknown as Settling };
}

describe('NumberField', () => {
  it('reports nothing when a field is left unchanged', () => {
    const { field, emitted } = setup('2');
    field.settle();
    expect(emitted).toEqual([]);
  });

  it('reports a typed value once', () => {
    const { field, emitted } = setup(null);
    field.field().setValue('5');
    field.settle();
    field.settle();
    expect(emitted).toEqual(['5']);
  });

  it('shows a numeric zero from a table cell', () => {
    const { field } = setup(0);
    expect(field.field().value).toBe('0');
  });
});
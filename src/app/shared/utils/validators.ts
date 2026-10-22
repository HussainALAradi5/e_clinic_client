import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { formatMoney, toMinor, toScaled } from './money';
import { passwordChecks } from './password';
import { MONEY_PATTERN } from '@shared/constants/limits.constants';
import { Currency } from '@shared/enums/shared/currency.enum';

/** Client validators mirroring server rules (the server stays the authority). */
export const AppValidators = {
  /** Required when the predicate (usually reading a sibling control) is true. */
  requiredIf(predicate: (control: AbstractControl) => boolean): ValidatorFn {
    return (control) => (predicate(control) ? Validators.required(control) : null);
  },

  /** ISO date strictly after (or equal when `allowEqual`) the sibling date control. */
  dateAfter(otherControl: string, allowEqual = true): ValidatorFn {
    return (control) => {
      const other = control.parent?.get(otherControl)?.value as string | null | undefined;
      const value = control.value as string | null;
      if (!value || !other) {
        return null;
      }
      return value > other || (allowEqual && value === other)
        ? null
        : { dateAfter: { other: otherControl } };
    };
  },

  /** Same value as the sibling control (password confirmation). */
  matchField(otherControl: string): ValidatorFn {
    return (control) =>
      control.value === control.parent?.get(otherControl)?.value
        ? null
        : { matchField: { other: otherControl } };
  },

  /** Server password policy (Password::defaults): ≥ 10 chars with upper, lower, digit and symbol. */
  strongPassword(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value ?? '');
    return !value || passwordChecks(value).every((check) => check.ok)
      ? null
      : { strongPassword: true };
  },

  /** E.164 phone (+97333123456). */
  phone(control: AbstractControl): ValidationErrors | null {
    return !control.value || /^\+[1-9]\d{6,14}$/.test(String(control.value).replace(/\s/g, ''))
      ? null
      : { phone: true };
  },

  positive(control: AbstractControl): ValidationErrors | null {
    return control.value === null || control.value === '' || Number(control.value) > 0
      ? null
      : { positive: true };
  },

  /** Money string with ≤ 3 decimals ('25.500'). */
  money(control: AbstractControl): ValidationErrors | null {
    return !control.value || MONEY_PATTERN.test(String(control.value)) ? null : { money: true };
  },

  /** Stock quantity: up to 2 decimals ('2.5' ml), negative allowed only for corrections. */
  quantity(control: AbstractControl): ValidationErrors | null {
    return !control.value || toScaled(String(control.value), 2) !== null
      ? null
      : { quantity: true };
  },

  /** Quantity no larger than `max()` (what is left on a prescription line, what a lot holds), compared exactly. */
  maxQuantity(max: () => string | null | undefined): ValidatorFn {
    return (control) => {
      const value = toScaled(control.value as string | null, 2);
      const limit = toScaled(max(), 2);
      return value === null || limit === null || value <= limit
        ? null
        : { maxQuantity: { max: max() } };
    };
  },

  /** Amount no larger than `max()` (a balance or what is left to refund), compared exactly in fils. */
  maxAmount(max: () => string | null | undefined): ValidatorFn {
    return (control) => {
      const value = toMinor(control.value as string | null);
      const limit = toMinor(max());
      return value === null || limit === null || value <= limit
        ? null
        : { maxAmount: { max: formatMoney({ amount: max() ?? '0', currency: Currency.BHD }) } };
    };
  },
};

/** Default English messages for control errors (used by the shared field components). */
export function errorMessage(
  errors: ValidationErrors | null | undefined,
  label = 'This field',
): string | null {
  if (!errors) {
    return null;
  }
  const [key, value] = Object.entries(errors)[0];
  const messages: Record<string, () => string> = {
    server: () => String(value),
    required: () => `${label} is required.`,
    email: () => 'Enter a valid email address.',
    minlength: () =>
      `${label} must be at least ${(value as { requiredLength: number }).requiredLength} characters.`,
    maxlength: () =>
      `${label} may not be longer than ${(value as { requiredLength: number }).requiredLength} characters.`,
    min: () => `${label} must be at least ${(value as { min: number }).min}.`,
    max: () => `${label} may not be greater than ${(value as { max: number }).max}.`,
    pattern: () => `${label} has an invalid format.`,
    phone: () => 'Enter the number in international format, e.g. +97333123456.',
    positive: () => `${label} must be greater than zero.`,
    money: () => 'Enter an amount with up to 3 decimals.',
    maxAmount: () => `${label} may not be more than ${(value as { max: string }).max}.`,
    quantity: () => 'Enter a quantity with up to 2 decimals.',
    maxQuantity: () => `${label} may not be more than ${(value as { max: string }).max}.`,
    dateAfter: () => `${label} must be on or after the start date.`,
    afterToday: () => `${label} must be after today.`,
    matchField: () => 'The values do not match.',
    strongPassword: () =>
      'Use at least 10 characters with upper and lower case letters, a number and a symbol.',
  };
  return messages[key]?.() ?? `${label} is invalid.`;
}

import { AbstractControl } from '@angular/forms';
import { toCamel } from '@utilities/case';
import { isApiError } from '@utilities/guards';
import { ApiError } from '@interfaces/api/api-error.interface';

/**
 * Puts 422 messages on the matching controls: `items.0.unit_price` → form.get(['items', 0, 'unitPrice']).
 * Returns the messages that matched no control (show them in a summary / toast).
 */
export function applyServerErrors(form: AbstractControl, error: ApiError | unknown): string[] {
  if (!isApiError(error) || !error.errors) {
    return [];
  }

  const unmatched: string[] = [];
  for (const [key, messages] of Object.entries(error.errors)) {
    const path = key.split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : toCamel(part)));
    const control = form.get(path);
    if (control) {
      control.setErrors({ ...(control.errors ?? {}), server: messages[0] });
      control.markAsTouched();
    } else {
      unmatched.push(...messages);
    }
  }
  return unmatched;
}

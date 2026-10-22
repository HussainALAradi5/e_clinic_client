import { FormGroup } from '@angular/forms';

/**
 * API payload from a reactive form: every field when creating (`all`), otherwise only the fields the user
 * changed. Strings are trimmed and blank strings become null; `skip` leaves fields out.
 */
export function dirtyPayload(
  form: FormGroup,
  skip: string[] = [],
  all = false,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, control] of Object.entries(form.controls)) {
    if (skip.includes(key) || (!all && !control.dirty)) {
      continue;
    }
    const value: unknown = control.value;
    payload[key] = typeof value === 'string' ? value.trim() || null : value;
  }
  return payload;
}

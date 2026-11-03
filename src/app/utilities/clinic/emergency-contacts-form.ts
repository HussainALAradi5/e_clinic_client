import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { EmergencyContact } from '@interfaces/clinic/emergency-contact.interface';
import {
  EmergencyContactForm,
  EmergencyContactsForm,
} from '@interfaces/clinic/emergency-contact-form.interface';
import { AppValidators } from '@validations/validators';

/** One contact row: the phone is needed once a row is added; name and relation stay optional. */
export function emergencyContactForm(
  contact: EmergencyContact | null = null,
): EmergencyContactForm {
  return new FormGroup({
    name: new FormControl(contact?.name ?? null, [Validators.maxLength(150)]),
    relation: new FormControl(contact?.relation ?? null, [Validators.maxLength(50)]),
    phone: new FormControl(contact?.phone ?? '', {
      nonNullable: true,
      validators: [Validators.required, AppValidators.phone],
    }),
  });
}

/** The patient's contacts as form rows (none is fine: they are optional). */
export function emergencyContactsForm(
  contacts: readonly EmergencyContact[] = [],
): EmergencyContactsForm {
  return new FormArray(contacts.map((c) => emergencyContactForm(c)));
}

/** Rows → payload: trimmed, blanks as null. */
export function toEmergencyContacts(form: EmergencyContactsForm): EmergencyContact[] {
  return form.getRawValue().map((c) => ({
    name: c.name?.trim() || null,
    relation: c.relation?.trim() || null,
    phone: c.phone.trim(),
  }));
}

/** One line per contact for read-only views: "Sara Yousif (Sister) +973 3600 1122". */
export function emergencyContactLine(contact: EmergencyContact): string {
  return [contact.name, contact.relation ? `(${contact.relation})` : null, contact.phone]
    .filter(Boolean)
    .join(' ');
}

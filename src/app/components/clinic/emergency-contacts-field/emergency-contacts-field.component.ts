import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TextField } from '@components/common/text-field/text-field.component';
import { EMERGENCY_CONTACTS_FIELD_TEXT } from '@constants/clinic/emergency-contacts-field.constants';
import { MAX_EMERGENCY_CONTACTS } from '@constants/limits.constants';
import { EmergencyContactsForm } from '@interfaces/clinic/emergency-contact-form.interface';
import { emergencyContactForm } from '@utilities/clinic/emergency-contacts-form';

/**
 * `<app-emergency-contacts-field [form]="form.controls.emergencyContacts" />` — up to three optional contacts
 * (name, relation, mobile), each removable; "Add a contact" until there are three. Used by the staff patient form
 * and the patient's own profile.
 */
@Component({
  selector: 'app-emergency-contacts-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, TextField],
  host: { class: 'block' },
  templateUrl: './emergency-contacts-field.component.html',
})
export class EmergencyContactsField {
  readonly form = input.required<EmergencyContactsForm>();

  protected readonly text = EMERGENCY_CONTACTS_FIELD_TEXT;
  protected readonly max = MAX_EMERGENCY_CONTACTS;
  /** Bumped on add / remove so the OnPush view redraws the rows. */
  protected readonly rows = signal(0);

  protected add(): void {
    if (this.form().length >= this.max) return;
    this.form().push(emergencyContactForm());
    this.form().markAsDirty();
    this.rows.update((n) => n + 1);
  }

  protected remove(index: number): void {
    this.form().removeAt(index);
    this.form().markAsDirty();
    this.rows.update((n) => n + 1);
  }
}

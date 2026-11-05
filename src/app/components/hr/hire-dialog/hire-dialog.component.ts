import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { EmploymentFields } from '../employment-fields/employment-fields.component';
import { employmentForm } from '@utilities/hr/employment-form';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { PersonFields } from '@components/common/person-fields/person-fields.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { RoleName } from '@enums/identity/role-name.enum';
import { UserType } from '@enums/identity/user-type.enum';
import { Employee } from '@interfaces/hr/employee.interface';
import { HireEmployeePayload } from '@interfaces/hr/hire-employee-payload.interface';
import { Person } from '@interfaces/identity/person.interface';
import { EnumService } from '@services/data/enum.service';
import { EmployeeApi } from '@services/hr/employee-api.service';
import { dirtyPayload } from '@utilities/form-payload';
import { newPersonForm, toNewPerson } from '@utilities/person';
import { HIRE_DIALOG_TEXT } from '@constants/hr/hire-dialog.constants';

/**
 * Hire: a new person or one already on file (e.g. a former patient) → account (type, roles, invitation) →
 * employment data, saved in one request. The server finds the person by national ID instead of duplicating.
 */
@Component({
  selector: 'app-hire-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    GenericForm,
    PersonFields,
    EntitySelect,
    SelectField,
    EmploymentFields,
  ],
  templateUrl: './hire-dialog.component.html',
})
export class HireDialog {
  protected readonly ref = inject(MatDialogRef<HireDialog, Employee>);
  private readonly api = inject(EmployeeApi);
  private readonly enums = inject(EnumService);

  protected readonly text = HIRE_DIALOG_TEXT;
  protected readonly mode = signal<'new' | 'existing'>('new');
  protected readonly person = newPersonForm(true);
  protected readonly existing = new FormControl<string | null>(null);
  protected readonly employment = employmentForm();
  protected readonly account = new FormGroup({
    userType: new FormControl<UserType | null>(UserType.MedicalStaff, [Validators.required]),
    roles: new FormControl<string[]>([], { nonNullable: true, validators: [Validators.required] }),
    canLogin: new FormControl(true, { nonNullable: true }),
  });
  protected readonly form = new FormGroup({
    person: this.person,
    existing: this.existing,
    employment: this.employment,
    account: this.account,
  });

  protected readonly userTypes = this.enums
    .options('UserType')
    .filter((o) => o.value !== UserType.Patient);
  protected readonly roles = this.enums
    .options('RoleName')
    .filter((o) => o.value !== RoleName.Patient && o.value !== RoleName.SuperAdmin);
  protected readonly personName = (p: Person): string => p.fullName;
  protected readonly personDetail = (p: Person): string => `${p.code} · ${p.phone}`;
  protected readonly isNew = computed(() => this.mode() === 'new');

  constructor() {
    this.setMode('new');
  }

  protected setMode(mode: 'new' | 'existing'): void {
    this.mode.set(mode);
    if (mode === 'new') {
      this.person.enable();
      this.existing.clearValidators();
    } else {
      this.person.disable();
      this.existing.setValidators([Validators.required]);
    }
    this.existing.updateValueAndValidity();
  }

  private saved: Employee | undefined;

  protected readonly submit = async (): Promise<Employee> => {
    const employment = dirtyPayload(this.employment, [], true);
    const account = this.account.getRawValue();
    const payload: HireEmployeePayload = {
      ...employment,
      iban: (employment['iban'] as string | null)?.replace(/\s/g, '').toUpperCase() ?? null,
      userType: account.userType as UserType,
      roles: account.roles,
      canLogin: account.canLogin,
      ...(this.isNew()
        ? { person: toNewPerson(this.person) }
        : { personId: this.existing.value as string }),
    };
    this.saved = await firstValueFrom(this.api.hire(payload));
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}

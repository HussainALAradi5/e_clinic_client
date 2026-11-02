import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { PatientFields } from '../patient-fields/patient-fields.component';
import { patientForm } from '@utilities/clinic/patient-form';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { PersonFields } from '@components/common/person-fields/person-fields.component';
import { ErrorCode } from '@enums/api/error-code.enum';
import { Patient, RegisterPatientPayload } from '@interfaces/clinic/patient.interface';
import { DuplicateCandidate, Person } from '@interfaces/identity/person.interface';
import { AccessService } from '@services/auth/access.service';
import { PatientApi } from '@services/clinic/patient-api.service';
import { isApiError } from '@utilities/guards';
import { dirtyPayload } from '@utilities/form-payload';
import { newPersonForm, toNewPerson } from '@utilities/person';
import { RegisterResult } from '@interfaces/clinic/patient-register-dialog.interface';

/**
 * Register a patient: search the person first (staff and relatives are often on file already) or enter a new one.
 * A phone + birth-date match comes back as candidates to pick instead of creating a duplicate.
 */
@Component({
  selector: 'app-patient-register-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    GenericForm,
    PersonFields,
    EntitySelect,
    PatientFields,
  ],
  templateUrl: './patient-register-dialog.component.html',
})
export class PatientRegisterDialog {
  protected readonly ref = inject(MatDialogRef<PatientRegisterDialog, RegisterResult>);
  private readonly api = inject(PatientApi);
  private readonly access = inject(AccessService);

  protected readonly mode = signal<'new' | 'existing'>('new');
  protected readonly candidates = signal<DuplicateCandidate[]>([]);
  protected readonly chosen = signal<Person | DuplicateCandidate | null>(null);
  protected readonly person = newPersonForm();
  protected readonly existing = new FormControl<string | null>(null);
  protected readonly patient = patientForm(null, this.access.can('patients.view_medical'));
  protected readonly form = new FormGroup({
    person: this.person,
    existing: this.existing,
    patient: this.patient,
  });

  protected readonly personName = (p: Person | DuplicateCandidate): string => p.fullName;
  protected readonly personDetail = (p: Person): string =>
    `${p.code} · ${p.phone}${p.dateOfBirth ? ' · born ' + p.dateOfBirth : ''}`;

  private result: RegisterResult | undefined;

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

  /** Use a duplicate candidate instead of creating a new person. */
  protected useCandidate(candidate: DuplicateCandidate): void {
    this.chosen.set(candidate);
    this.setMode('existing');
    this.existing.setValue(candidate.id);
    this.candidates.set([]);
  }

  protected readonly submit = async (): Promise<RegisterResult> => {
    const payload: RegisterPatientPayload = {
      ...(dirtyPayload(this.patient, [], true) as RegisterPatientPayload),
      ...(this.mode() === 'new'
        ? { person: toNewPerson(this.person) }
        : { personId: this.existing.value as string }),
    };
    try {
      this.result = { patient: await firstValueFrom(this.api.register(payload)) };
    } catch (error) {
      if (
        isApiError(error) &&
        error.code === ErrorCode.PatientAlreadyRegistered &&
        typeof error.meta?.['patientId'] === 'string'
      ) {
        this.result = { existingId: error.meta['patientId'] };
        return this.result;
      }
      if (isApiError(error) && error.code === ErrorCode.PersonDuplicate) {
        this.candidates.set((error.meta?.['candidates'] as DuplicateCandidate[] | undefined) ?? []);
      }
      throw error;
    }
    return this.result;
  };

  protected close(): void {
    this.ref.close(this.result);
  }
}

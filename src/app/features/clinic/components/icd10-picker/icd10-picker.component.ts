import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { Icd10Code } from '@shared/interfaces/clinic/medical-record.interface';
import { MedicalRecordApi } from '@shared/services/clinic/medical-record-api.service';

/** Type a code ("J06") or words in English or Arabic; pick a diagnosis. */
@Component({
  selector: 'app-icd10-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  host: { class: 'block' },
  templateUrl: './icd10-picker.component.html',
})
export class Icd10Picker {
  readonly disabled = input(false);
  readonly picked = output<Icd10Code>();

  private readonly api = inject(MedicalRecordApi);
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly results = toSignal(
    this.search.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((term) =>
        typeof term === 'string' && term.trim().length >= 2
          ? this.api.searchIcd10(term.trim()).pipe(catchError(() => of([])))
          : of([]),
      ),
    ),
    { initialValue: [] as Icd10Code[] },
  );

  protected select(event: MatAutocompleteSelectedEvent): void {
    this.picked.emit(event.option.value as Icd10Code);
    this.search.setValue('');
  }
}

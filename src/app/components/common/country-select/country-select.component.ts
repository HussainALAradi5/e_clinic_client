import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Country } from '@interfaces/reference/country.interface';
import { CountryApi } from '@services/reference/country-api.service';
import { errorMessage } from '@validations/validators';
import { Flag } from '@components/common/flag/flag.component';
import { COUNTRY_SELECT_TEXT } from '@constants/common/country-select.constants';

const MAX_SHOWN = 50;

/**
 * Searchable country picker bound to an ISO code control: `<ui-country-select label="Nationality"
 * mode="nationality" [control]="form.controls.nationalityCode" />`. Matches names, nationality,
 * ISO codes and dial code; GCC countries come first.
 */
@Component({
  selector: 'ui-country-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Flag, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
  host: { class: 'block' },
  templateUrl: './country-select.component.html',
})
export class CountrySelect implements OnInit {
  protected readonly text = COUNTRY_SELECT_TEXT;

  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string | null> | FormControl<string>>();
  /** `country` shows names, `nationality` shows nationality labels. */
  readonly mode = input<'country' | 'nationality'>('country');
  readonly hint = input<string | null>(null);

  private readonly api = inject(CountryApi);
  private readonly countries = toSignal(this.api.options(), { initialValue: [] as Country[] });
  private readonly destroyRef = inject(DestroyRef);

  protected readonly search = new FormControl('', { nonNullable: true });
  private readonly term = signal('');

  protected readonly matches = computed(() => {
    const term = this.term().trim().toLowerCase();
    const list = this.countries();
    const found = term
      ? list.filter((c) =>
          [c.code, c.iso3, c.name, c.nationality, c.phoneCode].some((v) =>
            v.toLowerCase().includes(term),
          ),
        )
      : list;
    return found.slice(0, MAX_SHOWN);
  });

  ngOnInit(): void {
    const sync = (): void => {
      const country = this.countries().find((c) => c.code === this.control().value);
      this.search.setValue(country ? this.display(country) : '', { emitEvent: false });
    };
    (this.control() as FormControl<string | null>).valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => sync());
    this.api
      .options()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => sync());
    this.search.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.term.set(value);
      if (value === '') {
        this.setCode(null);
      }
    });
  }

  /** What the field shows for a picked code (the option value), instead of the code itself. */
  protected readonly nameOf = (code: string | null): string => {
    const country = this.countries().find((c) => c.code === code);
    return country ? this.display(country) : (code ?? '');
  };

  protected display(country: Country): string {
    return this.mode() === 'nationality' ? country.nationality : country.name;
  }

  protected select(code: string): void {
    this.setCode(code);
    this.term.set('');
  }

  /** Leaving the field with free text that matches nothing restores the selected country. */
  protected blur(): void {
    const country = this.countries().find((c) => c.code === this.control().value);
    this.search.setValue(country ? this.display(country) : '', { emitEvent: false });
    this.control().markAsTouched();
  }

  protected error(): string | null {
    return errorMessage(this.control().errors, this.label());
  }

  private setCode(code: string | null): void {
    const control = this.control() as FormControl<string | null>;
    if (control.value !== code) {
      control.setValue(code);
      control.markAsDirty();
    }
  }
}

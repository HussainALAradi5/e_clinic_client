import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { FilterGroup } from '@shared/interfaces/list/list-query.interface';
import { ApiClient } from '@shared/services/api/api-client.service';
import { errorMessage } from '@shared/utils/validators';

const SEARCH_DEBOUNCE_MS = 250;
const PAGE_SIZE = 20;

/**
 * Searchable picker of one record from any list endpoint, bound to an id control:
 * `<ui-entity-select label="Patient" endpoint="patients" [display]="name" [control]="form.controls.patientId" />`.
 * Uses the generic list query (`search`, `filter`), so every list endpoint works without extra code.
 */
@Component({
  selector: 'ui-entity-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  host: { class: 'block' },
  templateUrl: './entity-select.component.html',
})
export class EntitySelect<T extends { id: string }> implements OnInit {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<string | null>>();
  readonly endpoint = input.required<string>();
  /** Text shown for a record. */
  readonly display = input.required<(row: T) => string>();
  /** Second line of an option (code, phone …). */
  readonly detail = input<((row: T) => string | null) | null>(null);
  readonly filter = input<FilterGroup | null>(null);
  readonly params = input<Record<string, string | number | boolean | null | undefined>>({});
  /** The currently selected record, so an existing value shows its name. */
  readonly initial = input<T | null>(null);
  readonly hint = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly autofocus = input(false);

  /** The picked record (null when cleared). */
  readonly picked = output<T | null>();

  private readonly api = inject(ApiClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly terms = new Subject<string>();

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly options = signal<T[]>([]);
  protected readonly loading = signal(false);
  private selected: T | null = null;

  ngOnInit(): void {
    this.selected = this.initial();
    this.search.setValue(this.selected ? this.display()(this.selected) : '', { emitEvent: false });

    this.control()
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        if (id === null) {
          this.selected = null;
          this.search.setValue('', { emitEvent: false });
        }
      });

    this.terms
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        switchMap((term) => {
          this.loading.set(true);
          return this.api
            .list<T>(
              this.endpoint(),
              {
                search: term || undefined,
                perPage: PAGE_SIZE,
                ...(this.filter() ? { filter: this.filter()! } : {}),
              },
              this.params(),
            )
            .pipe(catchError(() => of({ data: [] as T[], meta: { perPage: PAGE_SIZE } })));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        this.loading.set(false);
        this.options.set(page.data);
      });

    this.search.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((raw: unknown) => {
      // The autocomplete writes the picked row (not text) into the input for a moment.
      if (typeof raw !== 'string') return;
      this.terms.next(raw.trim());
      if (raw === '' && this.control().value !== null) {
        this.choose(null);
      }
    });
  }

  protected open(): void {
    if (this.options().length === 0) {
      this.terms.next(
        this.search.value.trim() === this.selectedText() ? '' : this.search.value.trim(),
      );
    }
  }

  protected choose(row: T | null): void {
    this.selected = row;
    this.control().setValue(row?.id ?? null);
    this.control().markAsDirty();
    this.search.setValue(row ? this.display()(row) : '', { emitEvent: false });
    this.picked.emit(row);
  }

  /** Leaving the field with half-typed text restores the chosen record's name. */
  protected blur(): void {
    this.control().markAsTouched();
    this.search.setValue(this.selectedText(), { emitEvent: false });
  }

  protected error(): string | null {
    return errorMessage(this.control().errors, this.label());
  }

  private selectedText(): string {
    return this.selected ? this.display()(this.selected) : '';
  }
}

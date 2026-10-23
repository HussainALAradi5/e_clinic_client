import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { debounceTime, distinctUntilChanged, Observable } from 'rxjs';
import { DateRangeFilter } from '@shared/components/date-range-filter/date-range-filter.component';
import { FilterPanel } from '@shared/components/filter-panel/filter-panel.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { hasTones } from '@shared/constants/status-tones.constants';
import { FilterFieldType } from '@shared/enums/list/filter-field-type.enum';
import { FilterOperator } from '@shared/enums/shared/filter-operator.enum';
import { DateRangeValue } from '@shared/interfaces/list/date-range-filter.interface';
import { FilterValue, ListQuery } from '@shared/interfaces/list/list-query.interface';
import { FilterDef, ResourceSchema } from '@shared/interfaces/list/resource-schema.interface';
import { FilterPanelData, FilterPanelResult } from '@shared/interfaces/ui/filter-panel.interface';
import { EnumService } from '@shared/services/data/enum.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { describe, fieldLabel } from '@shared/utils/filter-conditions';
import { rootConditions, setRootCondition } from '@shared/utils/list-query';

/**
 * List toolbar built from the resource schema: search, one date-range calendar, colour-badge pickers for statuses /
 * priorities, and a "Filters" side sheet with every other field. Active sheet filters show as removable chips.
 * Emits a ListQuery in the server grammar (root-level AND of field conditions); every change resets to page 1.
 */
@Component({
  selector: 'ui-generic-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    DateRangeFilter,
    StatusChip,
  ],
  host: { class: 'block' },
  templateUrl: './generic-filter.component.html',
})
export class GenericFilter implements OnInit {
  readonly schema = input.required<ResourceSchema>();
  readonly query = input.required<ListQuery>();
  /** Rows a query would return (the sheet's "Show N results"); optional. */
  readonly count = input<((query: ListQuery) => Observable<number>) | null>(null);
  readonly queryChange = output<ListQuery>();

  private readonly enums = inject(EnumService);
  private readonly dialogs = inject(DialogService);
  protected readonly search = new FormControl('', { nonNullable: true });
  /** Names of records picked in relation filters, so chips read "Doctor: Omar Khalil". */
  private readonly names = signal<Record<string, string>>({});

  protected readonly conditions = computed(() => rootConditions(this.query().filter));
  /** Coloured enums (status, priority) sit in the toolbar as badge pickers; the rest live in the sheet. */
  protected readonly quickFilters = computed(() =>
    this.schema().filters.filter((f) => f.type === FilterFieldType.Enum && hasTones(f.enum)),
  );
  private readonly sheetFilters = computed(() =>
    this.schema().filters.filter((f) => !f.hidden && !this.quickFilters().includes(f)),
  );
  /** Chips for every applied filter outside the toolbar — hidden ones too (set by a link), so the list never narrows silently. */
  protected readonly activeFilters = computed(() =>
    this.schema().filters.filter(
      (f) => !this.quickFilters().includes(f) && f.field in this.conditions(),
    ),
  );
  protected readonly dateFields = computed(() =>
    this.schema().dateFields.map((field) => ({ value: field, label: this.label(field) })),
  );
  protected readonly dateValue = computed<DateRangeValue>(() => {
    const q = this.query();
    return { field: q.dateField, preset: q.dateRange, from: q.dateFrom, to: q.dateTo };
  });
  protected readonly hasActive = computed(() => {
    const q = this.query();
    return (
      Object.keys(this.conditions()).length > 0 ||
      !!(q.search || q.dateRange || q.dateFrom || q.dateTo)
    );
  });

  constructor() {
    this.enums.load().subscribe({ error: () => undefined });
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((search) => this.patch({ search: search.trim() || undefined }));
  }

  ngOnInit(): void {
    this.search.setValue(this.query().search ?? '', { emitEvent: false });
  }

  protected label(field: string): string {
    return fieldLabel(this.schema(), field);
  }

  protected enumOptions(def: FilterDef) {
    return def.enum ? this.enums.options(def.enum) : [];
  }

  protected summary(def: FilterDef): string {
    return describe(this.conditions()[def.field] ?? {}, (v) =>
      def.enum
        ? this.enums.label(def.enum, v)
        : def.type === FilterFieldType.Relation
          ? (this.names()[String(v)] ?? 'selected')
          : String(v),
    );
  }

  protected selectedValues(def: FilterDef): (string | number)[] {
    const ops = this.conditions()[def.field] ?? {};
    const value = ops[FilterOperator.In] ?? ops[FilterOperator.Eq];
    return Array.isArray(value)
      ? value
      : value === undefined || value === null
        ? []
        : [value as string];
  }

  protected setValues(def: FilterDef, values: (string | number)[]): void {
    const condition: Record<string, FilterValue> | null = values.length
      ? def.operators.includes(FilterOperator.In)
        ? { in: values }
        : { eq: values[values.length - 1] }
      : null;
    this.patch({ filter: setRootCondition(this.query().filter, def.field, condition) });
  }

  protected setDate(value: DateRangeValue): void {
    this.patch({
      dateField: value.field,
      dateRange: value.preset,
      dateFrom: value.from,
      dateTo: value.to,
    });
  }

  /** Opens the side sheet with every non-toolbar filter; applies its answer in one go. */
  protected async openSheet(): Promise<void> {
    const result = await this.dialogs.open<FilterPanel, FilterPanelData, FilterPanelResult>(
      FilterPanel,
      {
        schema: this.schema(),
        query: this.query(),
        fields: this.sheetFilters().map((f) => f.field),
        names: this.names(),
        count: this.count() ?? undefined,
      },
      {
        width: '420px',
        maxWidth: '100vw',
        height: '100dvh',
        position: { right: '0', top: '0' },
        panelClass: 'ui-filter-sheet',
        autoFocus: false,
      },
    );
    if (result) {
      this.names.update((n) => ({ ...n, ...result.names }));
      this.patch({ filter: result.filter });
    }
  }

  protected remove(def: FilterDef): void {
    this.patch({ filter: setRootCondition(this.query().filter, def.field, null) });
  }

  protected clearAll(): void {
    this.search.setValue('', { emitEvent: false });
    this.queryChange.emit({
      ...this.query(),
      page: 1,
      filter: undefined,
      search: undefined,
      dateRange: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  }

  protected patch(changes: Partial<ListQuery>): void {
    this.queryChange.emit({ ...this.query(), ...changes, page: 1, cursor: undefined });
  }
}

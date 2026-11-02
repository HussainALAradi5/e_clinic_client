import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { DateRangeFilter } from '@components/common/date-range-filter/date-range-filter.component';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { RELATION_ENDPOINTS } from '@constants/relation-lookups.constants';
import { hasTones } from '@constants/status-tones.constants';
import { FilterFieldType } from '@enums/list/filter-field-type.enum';
import { FilterOperator } from '@enums/shared/filter-operator.enum';
import { DateRangeValue } from '@interfaces/list/date-range-filter.interface';
import { FilterValue } from '@interfaces/list/filter-value.type';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { FilterDef } from '@interfaces/list/filter-def.interface';
import { ResourceSchema } from '@interfaces/list/resource-schema.interface';
import { FilterDraft } from '@interfaces/ui/filter-draft.interface';
import { LookupRow } from '@interfaces/ui/lookup-row.interface';
import { EnumService } from '@services/data/enum.service';
import {
  conditionFrom,
  describe,
  draftFrom,
  fieldLabel,
  textHint,
} from '@utilities/filter-conditions';
import { rootConditions, setRootCondition } from '@utilities/list-query';
import { recordName } from '@utilities/text';
import { GENERIC_FILTER_TEXT } from '@constants/common/generic-filter.constants';

/** Labels named in the search placeholder before it ends in "…". */
const SEARCH_HINT_WORDS = 2;

/**
 * List toolbar built from the resource schema, every filter on the page (no side sheet): search, one date-range
 * calendar, colour-badge pickers for statuses / priorities, record pickers ("Opened by"), choices, yes / no, from–to
 * dates and amounts, text. Each change applies at once. A filter set by a link on a hidden field shows as a chip.
 * Emits a ListQuery in the server grammar (root-level AND of field conditions); every change resets to page 1.
 */
@Component({
  selector: 'ui-generic-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    MatButtonModule,
    MatDatepickerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    DateRangeFilter,
    EntitySelect,
    StatusChip,
  ],
  host: { class: 'block' },
  templateUrl: './generic-filter.component.html',
})
export class GenericFilter implements OnInit {
  readonly schema = input.required<ResourceSchema>();
  readonly query = input.required<ListQuery>();
  readonly queryChange = output<ListQuery>();

  private readonly enums = inject(EnumService);
  protected readonly search = new FormControl('', { nonNullable: true });
  /** Names of records picked in relation filters, so a picker reopens on "Omar Khalil", not an id. */
  private readonly names = signal<Record<string, string>>({});

  protected readonly conditions = computed(() => rootConditions(this.query().filter));
  /** Coloured enums (status, priority) show as badge pickers. */
  protected readonly quickFilters = computed(() =>
    this.schema().filters.filter((f) => f.type === FilterFieldType.Enum && hasTones(f.enum)),
  );
  /** Record filters ("Opened by", "Doctor") sit in the toolbar too, as searchable pickers. */
  protected readonly relationFilters = computed(() =>
    this.schema().filters.filter(
      (f) => !f.hidden && f.type === FilterFieldType.Relation && !!this.endpoint(f),
    ),
  );
  /** One id control per record filter, kept in step with the query (Clear all, a saved view, a link). */
  protected readonly relationControls = computed<Record<string, FormControl<string | null>>>(() =>
    Object.fromEntries(
      this.relationFilters().map((f) => [f.field, new FormControl<string | null>(null)]),
    ),
  );
  protected readonly lookupName = recordName;
  protected readonly lookupCode = (row: LookupRow): string | null => row.code ?? null;
  /** Every other filter, by type — except a choice with nothing to choose yet (no values in use). */
  protected readonly otherFilters = computed(() =>
    this.schema().filters.filter(
      (f) =>
        !f.hidden &&
        !this.quickFilters().includes(f) &&
        !this.relationFilters().includes(f) &&
        !(f.type === FilterFieldType.Choice && !f.options?.length),
    ),
  );
  /** Chips for applied filters on hidden fields (set by a link), so the list never narrows silently. */
  protected readonly hiddenActive = computed(() =>
    this.schema().filters.filter((f) => f.hidden && f.field in this.conditions()),
  );
  protected readonly types = FilterFieldType;
  protected readonly textHint = textHint;
  protected readonly dateFields = computed(() =>
    this.schema().dateFields.map((field) => ({ value: field, label: this.label(field) })),
  );
  protected readonly dateValue = computed<DateRangeValue>(() => {
    const q = this.query();
    return { field: q.dateField, preset: q.dateRange, from: q.dateFrom, to: q.dateTo };
  });
  /** "Search code, patient, treatment…" — what the box finds, from the server (every text column of the table). */
  protected readonly searchPlaceholder = computed(() => {
    const words = (this.schema().searchHint ?? []).map((label) => label.toLowerCase());
    return words.length
      ? GENERIC_FILTER_TEXT.search2(
          words.slice(0, SEARCH_HINT_WORDS).join(', '),
          words.length > SEARCH_HINT_WORDS ? '…' : '',
        )
      : GENERIC_FILTER_TEXT.search;
  });
  /** The whole list when the placeholder had to stop short. */
  protected readonly searchTip = computed(() => {
    const words = (this.schema().searchHint ?? []).map((label) => label.toLowerCase());
    return words.length > SEARCH_HINT_WORDS
      ? GENERIC_FILTER_TEXT.findsAnd(words.slice(0, -1).join(', '), words[words.length - 1])
      : '';
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
    effect(() => {
      const controls = this.relationControls();
      for (const def of this.relationFilters()) {
        const id = (this.selectedValues(def)[0] as string | undefined) ?? null;
        if (controls[def.field].value !== id)
          controls[def.field].setValue(id, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.search.setValue(this.query().search ?? '', { emitEvent: false });
  }

  protected label(field: string): string {
    return fieldLabel(this.schema(), field);
  }

  protected endpoint(def: FilterDef): string | null {
    return def.resource ? (RELATION_ENDPOINTS[def.resource] ?? null) : null;
  }

  protected initialRow(def: FilterDef): LookupRow | null {
    const id = this.selectedValues(def)[0] as string | undefined;
    return id ? { id, name: this.names()[id] ?? '' } : null;
  }

  protected pick(def: FilterDef, row: LookupRow | null): void {
    if (row) this.names.update((n) => ({ ...n, [row.id]: recordName(row) }));
    this.patch({
      filter: setRootCondition(this.query().filter, def.field, row ? { eq: row.id } : null),
    });
  }

  protected enumOptions(def: FilterDef) {
    return def.enum ? this.enums.options(def.enum) : [];
  }

  protected summary(def: FilterDef): string {
    return describe(this.conditions()[def.field] ?? {}, (v) =>
      def.enum
        ? this.enums.label(def.enum, v)
        : def.options
          ? (def.options.find((o) => o.value === String(v))?.label ?? String(v))
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

  /** The field's current conditions as editor values (from / to, yes / no, text). */
  protected draft(def: FilterDef): FilterDraft {
    return draftFrom(this.conditions()[def.field]);
  }

  /** One edit of a field (a bound, the yes / no, the text) → its server condition, applied at once. */
  protected setDraft(def: FilterDef, changes: Partial<FilterDraft>): void {
    const condition = conditionFrom(def, { ...this.draft(def), ...changes });
    this.patch({ filter: setRootCondition(this.query().filter, def.field, condition) });
  }

  /** A picked calendar day as the server's yyyy-mm-dd (empty when cleared). */
  protected day(value: Date | string | null): string {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 10);
    const pad = (n: number): string => String(n).padStart(2, '0');
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }

  protected inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
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

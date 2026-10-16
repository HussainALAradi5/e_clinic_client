import { NgTemplateOutlet } from '@angular/common';
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
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { DATE_PRESETS } from '@shared/constants/date-presets.constants';
import { FilterFieldType } from '@shared/enums/list/filter-field-type.enum';
import { DateRangePreset } from '@shared/enums/shared/date-range-preset.enum';
import { FilterOperator } from '@shared/enums/shared/filter-operator.enum';
import { Money } from '@shared/interfaces/common/money.interface';
import { FilterValue, ListQuery } from '@shared/interfaces/list/list-query.interface';
import { FilterDef, ResourceSchema } from '@shared/interfaces/list/resource-schema.interface';
import { FilterDraft } from '@shared/interfaces/ui/filter-draft.interface';
import { EnumService } from '@shared/services/data/enum.service';
import { rootConditions, setRootCondition } from '@shared/utils/list-query';
import { humanise } from '@shared/utils/text';

const EMPTY_DRAFT: FilterDraft = { values: [], text: '', min: '', max: '' };

/**
 * Search + date presets + filter chips built from the resource schema; emits a ListQuery in the server grammar
 * (root-level AND of field conditions). Debounced search; every change resets to page 1.
 */
@Component({
  selector: 'ui-generic-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  host: { class: 'block' },
  templateUrl: './generic-filter.component.html',
})
export class GenericFilter implements OnInit {
  readonly schema = input.required<ResourceSchema>();
  readonly query = input.required<ListQuery>();
  readonly queryChange = output<ListQuery>();

  private readonly enums = inject(EnumService);
  protected readonly presets = DATE_PRESETS;
  protected readonly types = FilterFieldType;
  protected readonly operators = FilterOperator;
  protected readonly customRange = DateRangePreset.Custom;
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly editing = signal<FilterDef | null>(null);
  protected readonly draft = signal<FilterDraft>(EMPTY_DRAFT);

  protected readonly conditions = computed(() => rootConditions(this.query().filter));
  protected readonly activeFilters = computed(() =>
    this.schema().filters.filter((f) => f.field in this.conditions()),
  );
  protected readonly availableFilters = computed(() =>
    this.schema().filters.filter((f) => !(f.field in this.conditions())),
  );
  protected readonly hasActive = computed(
    () =>
      this.activeFilters().length > 0 ||
      !!this.query().search ||
      !!this.query().dateRange ||
      !!this.query().dateFrom,
  );

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
    return (
      this.schema().columns.find((c) => c.field === field)?.label ??
      humanise(field.replace(/_id$/, ''))
    );
  }

  protected enumOptions(def: FilterDef) {
    return def.enum ? this.enums.options(def.enum) : [];
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected setDraft(changes: Partial<FilterDraft>): void {
    this.draft.update((d) => ({ ...d, ...changes }));
  }

  protected toggleValue(value: string | number): void {
    this.draft.update((d) => ({
      ...d,
      values: d.values.includes(value) ? d.values.filter((v) => v !== value) : [...d.values, value],
    }));
  }

  /** Loads the field's current conditions into the editor draft. */
  protected edit(def: FilterDef): void {
    const ops = this.conditions()[def.field] ?? {};
    const list = (v: FilterValue | undefined) =>
      Array.isArray(v) ? v : v === undefined || v === null ? [] : [v as string];
    const [betweenMin, betweenMax] = list(ops[FilterOperator.Between]);
    this.editing.set(def);
    this.draft.set({
      values: list(ops[FilterOperator.In] ?? ops[FilterOperator.Eq]),
      text: String(
        ops[FilterOperator.Like] ?? ops[FilterOperator.Starts] ?? ops[FilterOperator.Eq] ?? '',
      ),
      min: String(ops[FilterOperator.Gte] ?? betweenMin ?? ''),
      max: String(ops[FilterOperator.Lte] ?? betweenMax ?? ''),
    });
  }

  protected apply(def: FilterDef): void {
    this.patch({
      filter: setRootCondition(this.query().filter, def.field, this.compile(def, this.draft())),
    });
    this.editing.set(null);
  }

  protected remove(def: FilterDef): void {
    this.patch({ filter: setRootCondition(this.query().filter, def.field, null) });
    this.editing.set(null);
  }

  protected setPreset(preset: DateRangePreset | null): void {
    this.patch({ dateRange: preset ?? undefined, dateFrom: undefined, dateTo: undefined });
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

  protected summary(def: FilterDef): string {
    const ops = this.conditions()[def.field] ?? {};
    const symbols: Partial<Record<FilterOperator, string>> = {
      gte: '≥',
      lte: '≤',
      gt: '>',
      lt: '<',
      ne: '≠',
      like: 'contains',
      starts: 'starts with',
    };
    return Object.entries(ops)
      .map(([op, value]) => {
        const values = (Array.isArray(value) ? value : [value]).map((v) =>
          def.enum ? this.enums.label(def.enum, v as string) : String(v),
        );
        if (op === FilterOperator.Between) {
          return `${values[0]} – ${values[1]}`;
        }
        if (op === FilterOperator.Nin) {
          return `not ${values.join(', ')}`;
        }
        return `${symbols[op as FilterOperator] ? symbols[op as FilterOperator] + ' ' : ''}${values.join(', ')}`;
      })
      .join(' · ');
  }

  protected patch(changes: Partial<ListQuery>): void {
    this.queryChange.emit({ ...this.query(), ...changes, page: 1, cursor: undefined });
  }

  /** Draft → operators allowed by the schema for this field (null = remove). */
  private compile(def: FilterDef, draft: FilterDraft): Record<string, FilterValue> | null {
    const allows = (op: FilterOperator) => def.operators.includes(op);
    switch (def.type) {
      case FilterFieldType.Enum:
      case FilterFieldType.Relation:
        if (draft.values.length === 0 && !draft.text) {
          return null;
        }
        if (def.type === FilterFieldType.Relation && draft.text) {
          return { eq: draft.text.trim() };
        }
        return allows(FilterOperator.In) ? { in: draft.values } : { eq: draft.values[0] };
      case FilterFieldType.Boolean:
        return draft.text ? { eq: draft.text === 'true' } : null;
      case FilterFieldType.Number:
      case FilterFieldType.Money:
      case FilterFieldType.Date:
      case FilterFieldType.Datetime: {
        const { min, max } = draft;
        if (!min && !max) {
          return null;
        }
        if (
          min &&
          max &&
          !(allows(FilterOperator.Gte) && allows(FilterOperator.Lte)) &&
          allows(FilterOperator.Between)
        ) {
          return { between: [min, max] };
        }
        return { ...(min ? { gte: min } : {}), ...(max ? { lte: max } : {}) };
      }
      default: {
        const text = draft.text.trim();
        return text
          ? allows(FilterOperator.Like)
            ? { like: text }
            : allows(FilterOperator.Starts)
              ? { starts: text }
              : { eq: text }
          : null;
      }
    }
  }
}

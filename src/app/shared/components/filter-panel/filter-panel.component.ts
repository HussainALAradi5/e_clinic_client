import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { catchError, debounceTime, map, of, startWith, switchMap } from 'rxjs';
import { EntitySelect } from '@shared/components/entity-select/entity-select.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { RELATION_ENDPOINTS } from '@shared/constants/relation-lookups.constants';
import { hasTones } from '@shared/constants/status-tones.constants';
import { FilterFieldType } from '@shared/enums/list/filter-field-type.enum';
import { FilterGroup } from '@shared/interfaces/list/list-query.interface';
import { FilterDef } from '@shared/interfaces/list/resource-schema.interface';
import { FilterDraft } from '@shared/interfaces/ui/filter-draft.interface';
import { FilterPanelData, FilterPanelResult } from '@shared/interfaces/ui/filter-panel.interface';
import { LookupRow } from '@shared/interfaces/ui/lookup-row.interface';
import { EnumService } from '@shared/services/data/enum.service';
import {
  conditionFrom,
  draftFrom,
  EMPTY_DRAFT,
  fieldLabel,
  textHint,
} from '@shared/utils/filter-conditions';
import { rootConditions, setRootCondition } from '@shared/utils/list-query';
import { recordName } from '@shared/utils/text';

/** Wait for the user to stop typing before counting the matching rows. */
const COUNT_DEBOUNCE_MS = 350;

/**
 * All of a list's filters on one side sheet, each with the control that fits it: choices as pills, people and
 * records by name, yes / no, from–to amounts and dates, text as you type. Nothing changes until "Show N results",
 * which already says how many rows the filters will leave.
 */
@Component({
  selector: 'ui-filter-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    EntitySelect,
    StatusChip,
  ],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
})
export class FilterPanel {
  protected readonly data = inject<FilterPanelData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<FilterPanel, FilterPanelResult>);
  private readonly enums = inject(EnumService);

  protected readonly types = FilterFieldType;
  protected readonly hasTones = hasTones;
  protected readonly textHint = textHint;
  protected readonly name = recordName;
  protected readonly code = (row: LookupRow): string | null => row.code ?? null;

  protected readonly fields = this.data.schema.filters.filter((f) =>
    this.data.fields.includes(f.field),
  );
  private readonly initial = rootConditions(this.data.query.filter);
  protected readonly drafts = signal<Record<string, FilterDraft>>(
    Object.fromEntries(this.fields.map((f) => [f.field, draftFrom(this.initial[f.field])])),
  );
  private readonly names = signal<Record<string, string>>({ ...this.data.names });
  /** Relation pickers are bound to an id control each. */
  protected readonly relations = Object.fromEntries(
    this.fields
      .filter((f) => f.type === FilterFieldType.Relation)
      .map((f) => [
        f.field,
        new FormControl<string | null>((this.drafts()[f.field].values[0] as string) ?? null),
      ]),
  ) as Record<string, FormControl<string | null>>;

  /** The list's filter with every panel field replaced by its current answer. */
  private readonly filter = computed<FilterGroup>(() =>
    this.fields.reduce(
      (filter, def) =>
        setRootCondition(filter, def.field, conditionFrom(def, this.drafts()[def.field])),
      this.data.query.filter ?? {},
    ),
  );
  protected readonly active = computed(
    () => this.fields.filter((f) => conditionFrom(f, this.drafts()[f.field]) !== null).length,
  );
  /** Rows the filters would leave; null while counting or when the list cannot count. */
  protected readonly results = toSignal(
    toObservable(this.filter).pipe(
      debounceTime(COUNT_DEBOUNCE_MS),
      switchMap((filter) =>
        this.data.count
          ? this.data.count({ ...this.data.query, filter, page: 1 }).pipe(
              map((n): number | null => n),
              startWith(null),
              catchError(() => of(null)),
            )
          : of(null),
      ),
    ),
    { initialValue: null },
  );

  protected label(field: string): string {
    return fieldLabel(this.data.schema, field);
  }

  protected options(def: FilterDef) {
    return def.enum ? this.enums.options(def.enum) : [];
  }

  protected endpoint(def: FilterDef): string | null {
    return def.resource ? (RELATION_ENDPOINTS[def.resource] ?? null) : null;
  }

  protected initialRow(def: FilterDef): LookupRow | null {
    const id = this.relations[def.field]?.value;
    return id ? { id, name: this.names()[id] ?? '' } : null;
  }

  protected set(field: string, changes: Partial<FilterDraft>): void {
    this.drafts.update((all) => ({ ...all, [field]: { ...all[field], ...changes } }));
  }

  protected toggle(field: string, value: string | number): void {
    const values = this.drafts()[field].values;
    this.set(field, {
      values: values.includes(value) ? values.filter((v) => v !== value) : [...values, value],
    });
  }

  protected pick(field: string, row: LookupRow | null): void {
    if (row) this.names.update((n) => ({ ...n, [row.id]: recordName(row) }));
    this.set(field, { values: row ? [row.id] : [] });
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected reset(): void {
    this.drafts.set(Object.fromEntries(this.fields.map((f) => [f.field, EMPTY_DRAFT])));
    Object.values(this.relations).forEach((c) => c.setValue(null));
  }

  protected apply(): void {
    this.ref.close({ filter: this.filter(), names: this.names() });
  }
}

import { humanise } from '@shared/utils/text';
import { FilterFieldType } from '@shared/enums/list/filter-field-type.enum';
import { FilterOperator } from '@shared/enums/shared/filter-operator.enum';
import { FilterValue } from '@shared/interfaces/list/list-query.interface';
import { FilterDef } from '@shared/interfaces/list/resource-schema.interface';
import { FilterDraft } from '@shared/interfaces/ui/filter-draft.interface';

type Ops = Record<string, FilterValue>;

export const EMPTY_DRAFT: FilterDraft = { values: [], text: '', min: '', max: '' };

const list = (v: FilterValue | undefined): (string | number)[] =>
  Array.isArray(v) ? v : v === undefined || v === null ? [] : [v as string | number];

/** What the panel shows for a field's current server conditions. */
export function draftFrom(ops: Ops | undefined): FilterDraft {
  if (!ops) return EMPTY_DRAFT;
  const [betweenMin, betweenMax] = list(ops[FilterOperator.Between]);
  const one = ops[FilterOperator.Like] ?? ops[FilterOperator.Starts] ?? ops[FilterOperator.Eq];
  return {
    values: list(ops[FilterOperator.In] ?? ops[FilterOperator.Eq]),
    text: one === undefined || one === null ? '' : String(one),
    min: String(ops[FilterOperator.Gte] ?? betweenMin ?? ''),
    max: String(ops[FilterOperator.Lte] ?? betweenMax ?? ''),
  };
}

/** The panel's answer for a field → server conditions with the operators the schema allows (null = no filter). */
export function conditionFrom(def: FilterDef, draft: FilterDraft): Ops | null {
  const allows = (op: FilterOperator): boolean => def.operators.includes(op);
  switch (def.type) {
    case FilterFieldType.Enum:
    case FilterFieldType.Choice:
    case FilterFieldType.Relation:
      if (!draft.values.length) return null;
      return allows(FilterOperator.In) && draft.values.length > 1
        ? { in: draft.values }
        : { eq: draft.values[0] };
    case FilterFieldType.Boolean:
      return draft.text ? { eq: draft.text === 'true' } : null;
    case FilterFieldType.Number:
    case FilterFieldType.Money:
    case FilterFieldType.Date:
    case FilterFieldType.Datetime: {
      const { min, max } = draft;
      if (!min && !max) return null;
      if (min && max && !(allows(FilterOperator.Gte) && allows(FilterOperator.Lte))) {
        return { between: [min, max] };
      }
      return { ...(min ? { gte: min } : {}), ...(max ? { lte: max } : {}) };
    }
    default: {
      const text = draft.text.trim();
      if (!text) return null;
      return allows(FilterOperator.Like)
        ? { like: text }
        : allows(FilterOperator.Starts)
          ? { starts: text }
          : { eq: text };
    }
  }
}

/** How a text field matches, in words, for its placeholder. */
export function textHint(def: FilterDef): string {
  return def.operators.includes(FilterOperator.Like)
    ? 'Contains…'
    : def.operators.includes(FilterOperator.Starts)
      ? 'Starts with…'
      : 'Exact value';
}

/** Chip text of a field's conditions: "High, Urgent", "≥ 10", "1 Oct – 22 Oct", "contains ABC". */
export function describe(ops: Ops, label: (value: string | number) => string): string {
  const values = (v: FilterValue): string => list(v).map(label).join(', ');
  return Object.entries(ops)
    .map(([op, v]) => {
      switch (op as FilterOperator) {
        case FilterOperator.Between: {
          const [a, b] = list(v);
          return `${label(a)} – ${label(b)}`;
        }
        case FilterOperator.Gte:
          return `from ${values(v)}`;
        case FilterOperator.Lte:
          return `until ${values(v)}`;
        case FilterOperator.Gt:
          return `over ${values(v)}`;
        case FilterOperator.Lt:
          return `under ${values(v)}`;
        case FilterOperator.Like:
          return `contains ${values(v)}`;
        case FilterOperator.Starts:
          return `starts with ${values(v)}`;
        case FilterOperator.Nin:
        case FilterOperator.Ne:
          return `not ${values(v)}`;
        case FilterOperator.Null:
          return v === true || v === 'true' ? 'empty' : 'filled';
        default:
          return typeof v === 'boolean' ? (v ? 'Yes' : 'No') : values(v);
      }
    })
    .join(' · ');
}

/** Column label of a filter field (`doctor_id` → "Doctor" when no column names it). */
export function fieldLabel(
  schema: {
    filters: { field: string; label?: string }[];
    columns: { field: string; label: string }[];
  },
  field: string,
): string {
  return (
    schema.filters.find((f) => f.field === field)?.label ??
    schema.columns.find((c) => c.field === field)?.label ??
    humanise(field.replace(/_id$/, ''))
  );
}

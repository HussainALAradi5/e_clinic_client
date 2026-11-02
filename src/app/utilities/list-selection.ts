import { computed, signal } from '@angular/core';
import { toBulkFilter, toExportFilter } from '@utilities/list-query';
import { MAX_BULK_IDS } from '@constants/limits.constants';
import { SelectionMode } from '@enums/list/selection-mode.enum';
import { BulkActionRequest } from '@interfaces/bulk/bulk.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ExportRequest } from '@interfaces/list/export-request.interface';

/**
 * Multi-select state for tables (mirror of the bulk target set):
 * `ids` mode keeps ticked ids across pages (≤ 500); `query` mode = "select all N matching" minus unticked rows.
 */
export class ListSelection {
  private readonly _mode = signal<SelectionMode>(SelectionMode.Ids);
  private readonly _ids = signal<ReadonlySet<string>>(new Set());
  private readonly _excluded = signal<ReadonlySet<string>>(new Set());
  private readonly _query = signal<ListQuery | null>(null);
  private readonly _total = signal(0);

  readonly mode = this._mode.asReadonly();
  readonly count = computed(() =>
    this._mode() === SelectionMode.Query ? this._total() - this._excluded().size : this._ids().size,
  );
  readonly hasSelection = computed(() => this.count() > 0);
  /** Ticked ids (ids mode only — empty in "select all matching" mode). */
  readonly pickedIds = computed(() => (this._mode() === SelectionMode.Ids ? [...this._ids()] : []));
  readonly limitReached = computed(
    () => this._mode() === SelectionMode.Ids && this._ids().size >= MAX_BULK_IDS,
  );

  isSelected(id: string): boolean {
    return this._mode() === SelectionMode.Query ? !this._excluded().has(id) : this._ids().has(id);
  }

  toggle(id: string): void {
    if (this._mode() === SelectionMode.Query) {
      this._excluded.update((s) => toggled(s, id));
    } else if (this._ids().has(id) || !this.limitReached()) {
      this._ids.update((s) => toggled(s, id));
    }
  }

  /** Header checkbox: tick (or untick) every row of the current page. */
  setPage(ids: readonly string[], selected: boolean): void {
    if (this._mode() === SelectionMode.Query) {
      this._excluded.update((s) => withAll(s, ids, !selected));
      return;
    }
    this._ids.update((s) =>
      withAll(
        s,
        selected ? ids.slice(0, Math.max(0, MAX_BULK_IDS - s.size + countIn(s, ids))) : ids,
        selected,
      ),
    );
  }

  allSelected(ids: readonly string[]): boolean {
    return ids.length > 0 && ids.every((id) => this.isSelected(id));
  }

  someSelected(ids: readonly string[]): boolean {
    return ids.some((id) => this.isSelected(id)) && !this.allSelected(ids);
  }

  selectAllMatching(query: ListQuery, total: number): void {
    this._mode.set(SelectionMode.Query);
    this._query.set(query);
    this._total.set(total);
    this._excluded.set(new Set());
  }

  clear(): void {
    this._mode.set(SelectionMode.Ids);
    this._ids.set(new Set());
    this._excluded.set(new Set());
    this._query.set(null);
    this._total.set(0);
  }

  /** What an export of the selection sends: the ticked ids, or the "all matching" query minus unticked rows. */
  toExportTarget(): Pick<ExportRequest, 'ids' | 'filter'> {
    const query = this._query();
    return this._mode() === SelectionMode.Query && query
      ? { filter: toExportFilter(query, [...this._excluded()]) }
      : { ids: [...this._ids()] };
  }

  toBulkRequest(action: string, extra: Partial<BulkActionRequest> = {}): BulkActionRequest {
    const query = this._query();
    return this._mode() === SelectionMode.Query && query
      ? { ...extra, action, filter: toBulkFilter(query, [...this._excluded()]) }
      : { ...extra, action, ids: [...this._ids()] };
  }
}

function toggled(set: ReadonlySet<string>, id: string): ReadonlySet<string> {
  const next = new Set(set);
  next.has(id) ? next.delete(id) : next.add(id);
  return next;
}

function withAll(
  set: ReadonlySet<string>,
  ids: readonly string[],
  add: boolean,
): ReadonlySet<string> {
  const next = new Set(set);
  ids.forEach((id) => (add ? next.add(id) : next.delete(id)));
  return next;
}

function countIn(set: ReadonlySet<string>, ids: readonly string[]): number {
  return ids.filter((id) => set.has(id)).length;
}

import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  output,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CellDef } from './cell.directive';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { Page } from '@shared/interfaces/api/page.interface';
import { TableColumn } from '@shared/interfaces/ui/table.interface';
import { ListSelection } from '@shared/utils/list-selection';
import { readPath } from '@shared/utils/read-path';

const SELECT = '__select';

/**
 * Server-side table: sort (multi via the query), checkbox selection with shift-click ranges, header "select page",
 * "select all N matching" banner, skeleton rows, row click, custom cells (uiCell). Scrolls horizontally on small screens.
 */
@Component({
  selector: 'ui-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTableModule, MatSortModule, MatCheckboxModule, NgTemplateOutlet, Skeleton],
  host: { class: 'block' },
  templateUrl: './data-table.component.html',
})
export class DataTable<T extends { id: string }> {
  readonly columns = input.required<TableColumn[]>();
  readonly page = input<Page<T> | null>(null);
  readonly loading = input(false);
  /** Current compact sort (['-createdAt']). */
  readonly sort = input<string[]>([]);
  readonly selection = input<ListSelection | null>(null);
  /** Templates passed through from a parent (ResourceListPage). */
  readonly cellDefs = input<readonly CellDef<T>[]>([]);

  readonly sortChange = output<string[]>();
  readonly rowClick = output<T>();
  readonly selectAllMatching = output<void>();

  private readonly ownCells = contentChildren(CellDef<T>);
  private lastChecked: number | null = null;

  protected readonly selectColumn = SELECT;
  protected readonly read = readPath;
  protected readonly rows = computed(() => this.page()?.data ?? []);
  protected readonly total = computed(() => this.page()?.meta.total ?? 0);
  protected readonly pageIds = computed(() => this.rows().map((r) => r.id));
  protected readonly displayed = computed(() => [
    ...(this.selection() ? [SELECT] : []),
    ...this.columns().map((c) => c.field),
  ]);
  protected readonly cellTemplates = computed(
    () =>
      new Map(
        [...this.cellDefs(), ...this.ownCells()].map(
          (def) => [def.uiCell(), def.template] as const,
        ),
      ),
  );
  protected readonly allOnPageSelected = computed(
    () => this.selection()?.allSelected(this.pageIds()) ?? false,
  );
  protected readonly someOnPageSelected = computed(
    () => this.selection()?.someSelected(this.pageIds()) ?? false,
  );
  protected readonly canSelectAllMatching = computed(() => this.total() > this.rows().length);
  protected readonly sortActive = computed(() => this.sort()[0]?.replace(/^-/, '') ?? '');
  protected readonly sortDirection = computed(() =>
    this.sort()[0]?.startsWith('-') ? 'desc' : this.sort()[0] ? 'asc' : '',
  );

  protected onSort(sort: Sort): void {
    this.sortChange.emit(
      sort.direction ? [(sort.direction === 'desc' ? '-' : '') + sort.active] : [],
    );
  }

  /** Click toggles; shift-click selects the range from the last clicked row. */
  protected onCheck(event: MouseEvent, index: number): void {
    const selection = this.selection()!;
    const ids = this.pageIds();
    if (event.shiftKey && this.lastChecked !== null) {
      const [from, to] = [Math.min(this.lastChecked, index), Math.max(this.lastChecked, index)];
      selection.setPage(ids.slice(from, to + 1), !selection.isSelected(ids[index]));
    } else {
      selection.toggle(ids[index]);
    }
    this.lastChecked = index;
  }
}

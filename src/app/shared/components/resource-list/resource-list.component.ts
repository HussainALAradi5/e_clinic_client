import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceListStore } from './resource-list.store';
import { BulkActionBar } from '@shared/components/bulk-action-bar/bulk-action-bar.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { DataTable } from '@shared/components/data-table/data-table.component';
import { EmptyState } from '@shared/components/empty-state/empty-state.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { GenericFilter } from '@shared/components/generic-filter/generic-filter.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Paginator } from '@shared/components/paginator/paginator.component';
import { SavedViews } from '@shared/components/saved-views/saved-views.component';
import { ListQuery } from '@shared/interfaces/list/list-query.interface';
import { PageChange, TableColumn } from '@shared/interfaces/ui/table.interface';
import { SavedView } from '@shared/interfaces/view/saved-view.interface';
import { defaultQuery, fromViewQuery, queryFromUrl, queryToUrl } from '@shared/utils/list-query';

/**
 * Generic list page for any resource: schema-driven filters, saved views, table, pagination, multi-select bulk bar.
 * Feature list pages are configuration + cell templates (`[bulk]` content adds page-specific bulk buttons):
 *
 * <ui-resource-list resource="rooms" endpoint="clinic/rooms" title="Rooms" rowLink="/clinic/rooms/:id">
 *   <ui-button actions …>New room</ui-button>
 *   <ng-template uiCell="type" let-row>…</ng-template>
 * </ui-resource-list>
 */
@Component({
  selector: 'ui-resource-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ResourceListStore],
  imports: [
    PageHeader,
    GenericFilter,
    SavedViews,
    BulkActionBar,
    DataTable,
    Paginator,
    EmptyState,
    ErrorState,
  ],
  host: { class: 'block' },
  templateUrl: './resource-list.component.html',
})
export class ResourceListPage implements OnInit {
  /** Permission resource / schema name, e.g. 'rooms'. */
  readonly resource = input.required<string>();
  /** API path, e.g. 'clinic/rooms' (defaults to the resource name). */
  readonly endpoint = input<string | null>(null);
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  /** Subset / order of schema columns, e.g. ['code', 'name', 'status']. */
  readonly columns = input<string[] | null>(null);
  /** Router link with `:id`, e.g. '/clinic/rooms/:id'. */
  readonly rowLink = input<string | null>(null);
  readonly defaults = input<ListQuery>(defaultQuery());
  readonly emptyTitle = input('No records found');
  /** Offer the saved-views menu. */
  readonly views = input(true);

  readonly rowClick = output<{ id: string }>();

  protected readonly store = inject(ResourceListStore);
  /** Multi-select state (pages read it for their own `[bulk]` buttons). */
  readonly selection = this.store.selection();
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly cells = contentChildren(CellDef);
  /** Current list query (filters, period, sort) — e.g. for an export of what is on screen. */
  readonly currentQuery = computed(() => this.store.query());
  /** Columns chosen by the applied saved view. */
  private readonly viewColumns = signal<string[] | null>(null);
  /** The list opened without state in the URL → the user's default view may apply. */
  protected readonly pristineUrl = Object.keys(this.route.snapshot.queryParams).length === 0;
  protected readonly endpointPath = computed(() => this.endpoint() ?? this.resource());
  protected readonly selectable = computed(
    () => (this.store.schema()?.bulkActions.length ?? 0) > 0,
  );
  protected readonly tableColumns = computed<TableColumn[]>(() => {
    const schema = this.store.schema();
    if (!schema) {
      return [];
    }
    const known = new Set(schema.columns.map((c) => c.field));
    const fromView = this.viewColumns()?.filter((field) => known.has(field));
    const pick = (fromView?.length ? fromView : null) ?? this.columns() ?? [...known];
    return pick.map((field) => ({
      field,
      label: schema.columns.find((c) => c.field === field)?.label ?? field,
      sortable: schema.sortable.includes(field),
    }));
  });

  ngOnInit(): void {
    this.store.init(
      this.resource(),
      this.endpointPath(),
      queryFromUrl(this.route.snapshot.queryParams, this.defaults()),
    );
  }

  /** Re-fetches the current page (after a change made outside the list, e.g. in a dialog). */
  reload(): void {
    this.store.reload();
  }

  protected setQuery(query: ListQuery): void {
    this.store.setQuery(query);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryToUrl(query, this.defaults()),
      replaceUrl: true,
    });
  }

  protected applyView(view: SavedView): void {
    this.viewColumns.set(view.columns.length ? view.columns : null);
    this.setQuery(fromViewQuery(view.query, this.defaults()));
  }

  protected readonly visibleColumns = computed(() => this.tableColumns().map((c) => c.field));

  protected onPage(change: PageChange): void {
    this.setQuery({
      ...this.store.query(),
      page: change.page,
      perPage: change.perPage,
      cursor: change.cursor,
    });
  }

  protected open(row: { id: string }): void {
    this.rowClick.emit(row);
    const link = this.rowLink();
    if (link) {
      void this.router.navigateByUrl(link.replace(':id', row.id));
    }
  }
}

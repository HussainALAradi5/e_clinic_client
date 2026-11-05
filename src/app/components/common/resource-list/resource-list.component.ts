import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceListStore } from './resource-list.store';
import { BulkActionBar } from '@components/common/bulk-action-bar/bulk-action-bar.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { DataTable } from '@components/common/data-table/data-table.component';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { ExportMenu } from '@components/common/export-menu/export-menu.component';
import { ImportDialog } from '@components/common/import-dialog/import-dialog.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { GenericFilter } from '@components/common/generic-filter/generic-filter.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Paginator } from '@components/common/paginator/paginator.component';
import { SavedViews } from '@components/common/saved-views/saved-views.component';
import { ExportFormat } from '@enums/list/export-format.enum';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ImportDialogData } from '@interfaces/list/import-dialog-data.interface';
import { ImportResult } from '@interfaces/list/import-result.interface';
import { TransferService } from '@services/data/transfer.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { PageChange } from '@interfaces/ui/page-change.interface';
import { TableColumn } from '@interfaces/ui/table.interface';
import { SavedView } from '@interfaces/view/saved-view.interface';
import { defaultQuery, fromViewQuery, queryFromUrl, queryToUrl } from '@utilities/list-query';
import { RESOURCE_LIST_TEXT } from '@constants/common/resource-list.constants';

/**
 * Generic list page for any resource: schema-driven filters, saved views, table, pagination, multi-select bulk bar,
 * and — when the server offers them to this user — Export (Excel / PDF / CSV) and Excel Import.
 * Feature list pages are configuration + cell templates (`[bulk]` content adds page-specific bulk buttons):
 *
 * <ui-resource-list resource="rooms" endpoint="rooms" title="Rooms" rowLink="/clinic/rooms/:id">
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
    ExportMenu,
    MatButtonModule,
    MatIconModule,
  ],
  host: { class: 'block' },
  templateUrl: './resource-list.component.html',
})
export class ResourceListPage implements OnInit {
  protected readonly text = RESOURCE_LIST_TEXT;

  /** Permission resource / schema name, e.g. 'rooms'. */
  readonly resource = input.required<string>();
  /** API path, e.g. 'billing/services' (defaults to the resource name). */
  readonly endpoint = input<string | null>(null);
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  /** Subset / order of schema columns, e.g. ['code', 'name', 'status']. */
  readonly columns = input<string[] | null>(null);
  /** Router link with `:id`, e.g. '/clinic/rooms/:id'. */
  readonly rowLink = input<string | null>(null);
  readonly defaults = input<ListQuery>(defaultQuery());
  readonly emptyTitle = input(RESOURCE_LIST_TEXT.noRecordsFound);
  /** Offer the saved-views menu. */
  readonly views = input(true);
  /** Fixed endpoint parameters, e.g. `{ role: 'doctor' }` (the users of one role). */
  readonly params = input<Record<string, string>>({});
  /** Extra classes per row (e.g. a coloured edge for the row's state). */
  readonly rowClass = input<((row: { id: string }) => string | null) | null>(null);
  /**
   * Inside another page (a tab of a detail page): no page header, saved views or import / export, and the filters
   * stay out of the address bar.
   */
  readonly embedded = input(false, { transform: booleanAttribute });

  readonly rowClick = output<{ id: string }>();

  protected readonly store = inject(ResourceListStore);
  /** Multi-select state (pages read it for their own `[bulk]` buttons). */
  readonly selection = this.store.selection();
  private readonly router = inject(Router);
  private readonly transfer = inject(TransferService);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly route = inject(ActivatedRoute);

  protected readonly cells = contentChildren(CellDef);
  /** Current list query (filters, period, sort) — e.g. for an export of what is on screen. */
  readonly currentQuery = computed(() => this.store.query());
  /** Columns chosen by the applied saved view. */
  private readonly viewColumns = signal<string[] | null>(null);
  /** The list opened without state in the URL → the user's default view may apply. */
  protected readonly pristineUrl = Object.keys(this.route.snapshot.queryParams).length === 0;
  protected readonly endpointPath = computed(() => this.endpoint() ?? this.resource());
  /** Row checkboxes when the user can act on rows: a bulk action, or export of the ticked rows. */
  protected readonly selectable = computed(() => {
    const schema = this.store.schema();
    return !!schema && (schema.bulkActions.length > 0 || schema.exportFormats.length > 0);
  });
  protected readonly tableColumns = computed<TableColumn[]>(() => {
    const schema = this.store.schema();
    if (!schema) {
      return [];
    }
    const known = new Set(schema.columns.map((c) => c.field));
    const fromView = this.viewColumns()?.filter((field) => known.has(field));
    const pick = (fromView?.length ? fromView : null) ?? this.columns() ?? [...known];
    return pick.map((field) => {
      const column = schema.columns.find((c) => c.field === field);
      return {
        field,
        label: column?.label ?? field,
        enum: column?.enum,
        sortable: schema.sortable.includes(field),
      };
    });
  });

  constructor() {
    // Changed parameters (a quick filter of the page) reload the list; the first value is used by init().
    let first = true;
    effect(() => {
      const params = this.params();
      if (first) {
        first = false;
        return;
      }
      untracked(() => this.store.setParams(params));
    });
  }

  ngOnInit(): void {
    this.store.init(
      this.resource(),
      this.endpointPath(),
      this.embedded()
        ? this.defaults()
        : queryFromUrl(this.route.snapshot.queryParams, this.defaults()),
      this.params(),
    );
  }

  /** Re-fetches the current page (after a change made outside the list, e.g. in a dialog). */
  reload(): void {
    this.store.reload();
  }

  protected setQuery(query: ListQuery): void {
    this.store.setQuery(query);
    if (this.embedded()) {
      return;
    }
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

  /** Exports the ticked rows, or the whole filtered list, in the visible columns (one request). */
  protected readonly exportAs = (format: ExportFormat): Promise<void> =>
    this.transfer.export(
      this.endpointPath(),
      format,
      this.store.query(),
      this.visibleColumns(),
      this.selectable() ? this.selection : null,
    );

  protected async openImport(): Promise<void> {
    const result = await this.dialogs.open<ImportDialog, ImportDialogData, ImportResult>(
      ImportDialog,
      { endpoint: this.endpointPath(), title: this.title() },
      { width: '640px' },
    );
    if (result) {
      this.notify.success(
        `${result.created.toLocaleString('en-GB')} record${result.created === 1 ? '' : 's'} imported.`,
      );
      this.store.reload();
    }
  }
}

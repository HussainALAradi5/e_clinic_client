import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { delay, Observable, of, switchMap, throwError, timer } from 'rxjs';
import { DemoRow } from './interfaces/demo-row.interface';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { DataTable } from '@shared/components/data-table/data-table.component';
import { EmptyState } from '@shared/components/empty-state/empty-state.component';
import { GenericFilter } from '@shared/components/generic-filter/generic-filter.component';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { MoneyInput } from '@shared/components/money-input/money-input.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Paginator } from '@shared/components/paginator/paginator.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { FilterFieldType } from '@shared/enums/list/filter-field-type.enum';
import { Currency } from '@shared/enums/shared/currency.enum';
import { FilterOperator } from '@shared/enums/shared/filter-operator.enum';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { Page } from '@shared/interfaces/api/page.interface';
import { Money } from '@shared/interfaces/common/money.interface';
import { FilterCondition, ListQuery } from '@shared/interfaces/list/list-query.interface';
import { ResourceSchema } from '@shared/interfaces/list/resource-schema.interface';
import { TableColumn } from '@shared/interfaces/ui/table.interface';
import { AgePipe } from '@shared/pipes/age.pipe';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { MaskPipe } from '@shared/pipes/mask.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { RelativeTimePipe } from '@shared/pipes/relative-time.pipe';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { ThemeService } from '@shared/services/ui/theme.service';
import { ListSelection } from '@shared/utils/list-selection';
import { money } from '@shared/utils/money';
import { AppValidators } from '@shared/utils/validators';

const STATUSES: GenericStatus[] = Object.values(GenericStatus);
const ROWS: DemoRow[] = Array.from({ length: 42 }, (_, i) => ({
  id: `row-${i + 1}`,
  code: `WID-2026-${String(i + 1).padStart(6, '0')}`,
  name: ['Physiotherapy', 'Wound care', 'Dialysis', 'Laser', 'Injection'][i % 5] + ` #${i + 1}`,
  status: STATUSES[i % 4],
  price: { amount: (12.5 + i * 3.25).toFixed(3), currency: Currency.BHD },
  updatedAt: new Date(Date.now() - i * 3_600_000).toISOString(),
}));

const SCHEMA: ResourceSchema = {
  resource: 'widgets',
  filters: [
    {
      field: 'status',
      type: FilterFieldType.Enum,
      enum: 'GenericStatus',
      operators: [FilterOperator.In, FilterOperator.Nin],
    },
    { field: 'name', type: FilterFieldType.Text, operators: [FilterOperator.Like] },
    {
      field: 'price',
      type: FilterFieldType.Money,
      operators: [FilterOperator.Gte, FilterOperator.Lte, FilterOperator.Between],
    },
  ],
  sortable: ['code', 'name'],
  search: true,
  dateFields: ['updated_at'],
  columns: [
    { field: 'code', label: 'Code' },
    { field: 'name', label: 'Name' },
    { field: 'status', label: 'Status' },
    { field: 'price', label: 'Price' },
    { field: 'updated_at', label: 'Updated' },
  ],
  bulkActions: [],
  exportFormats: [],
  defaultSort: '-updated_at',
  archivable: true,
};

/**
 * Living style guide for the shared UI kit (works without the API). Remove the route once the shell exists.
 */
@Component({
  selector: 'app-ui-kit-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppButton,
    StatusChip,
    PageHeader,
    DataTable,
    CellDef,
    Paginator,
    GenericFilter,
    EmptyState,
    Skeleton,
    GenericForm,
    TextField,
    SelectField,
    MoneyInput,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MoneyPipe,
    DurationPipe,
    AgePipe,
    MaskPipe,
    RelativeTimePipe,
  ],
  templateUrl: './ui-kit.page.html',
})
export class UiKitPage {
  protected readonly theme = inject(ThemeService);
  private readonly notify = inject(NotifyService);
  private readonly dialogs = inject(DialogService);

  protected readonly statuses = STATUSES;
  protected readonly rows = ROWS;
  protected readonly sampleMoney = money('1250.5');
  protected readonly schema = SCHEMA;
  protected readonly selection = new ListSelection();
  protected readonly genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];
  protected readonly columns: TableColumn[] = SCHEMA.columns.map((c) => ({
    ...c,
    sortable: SCHEMA.sortable.includes(c.field),
    align: c.field === 'price' ? 'end' : 'start',
  }));
  protected readonly query = signal<ListQuery>({ page: 1, perPage: 10, sort: ['code'] });
  protected readonly page = signal<Page<DemoRow>>(
    this.slice({ page: 1, perPage: 10, sort: ['code'] }),
  );

  protected readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', { nonNullable: true, validators: [AppValidators.phone] }),
    gender: new FormControl<string | null>(null, Validators.required),
    deposit: new FormControl<string | null>(null, AppValidators.money),
  });

  protected readonly save = (): Observable<unknown> => of(true).pipe(delay(1000));

  protected readonly fail = (): Observable<unknown> =>
    timer(600).pipe(
      switchMap(() =>
        throwError(() =>
          this.demoError(
            'This slot was just booked — pick another time.',
            'SLOT_UNAVAILABLE',
            null,
          ),
        ),
      ),
    );

  /** Simulates a 422 from the server: the phone message lands under the field. */
  protected readonly submit = (): Observable<unknown> =>
    timer(700).pipe(
      switchMap(() =>
        throwError(() =>
          this.demoError('Some fields are invalid.', 'VALIDATION_FAILED', {
            phone: ['This phone number is already registered.'],
          }),
        ),
      ),
    );

  protected setQuery(query: ListQuery): void {
    this.query.set(query);
    this.page.set(this.slice(query));
  }

  private slice(query: ListQuery): Page<DemoRow> {
    const search = query.search?.toLowerCase();
    const statusIn = (query.filter?.and ?? [])
      .map((n) => (n as FilterCondition)['status']?.[FilterOperator.In] as string[] | undefined)
      .find(Boolean);
    const sortKey = (query.sort?.[0] ?? 'code').replace('-', '') as keyof DemoRow;
    const dir = query.sort?.[0]?.startsWith('-') ? -1 : 1;
    const filtered = ROWS.filter(
      (r) =>
        (!search || r.name.toLowerCase().includes(search)) &&
        (!statusIn || statusIn.includes(r.status)),
    ).sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])) * dir);
    const perPage = query.perPage ?? 10;
    const page = query.page ?? 1;
    return {
      data: filtered.slice((page - 1) * perPage, page * perPage),
      meta: {
        currentPage: page,
        perPage,
        total: filtered.length,
        lastPage: Math.max(1, Math.ceil(filtered.length / perPage)),
      },
    };
  }

  private demoError(
    message: string,
    code: string,
    errors: Record<string, string[]> | null,
  ): ApiError {
    return {
      status: code === 'VALIDATION_FAILED' ? 422 : 409,
      code,
      message,
      errors,
      meta: null,
      requestId: crypto.randomUUID(),
    };
  }
}

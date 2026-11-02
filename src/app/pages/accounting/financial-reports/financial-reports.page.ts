import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { REPORTS, reportCell, reportKind, reportLink } from '@utilities/accounting/report';
import { ReportDefinition } from '@interfaces/accounting/report-definition.interface';
import { AppButton } from '@components/common/app-button/app-button.component';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { ReportType } from '@enums/accounting/report-type.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Account } from '@interfaces/accounting/account.interface';
import { ReportParams } from '@interfaces/accounting/report-params.interface';
import { ReportRow } from '@interfaces/accounting/report-row.type';
import { ReportTable } from '@interfaces/accounting/report-table.interface';
import { ApiError } from '@interfaces/api/api-error.interface';
import { Department } from '@interfaces/hr/department.interface';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { ReportApi } from '@services/accounting/report-api.service';
import { addDays, clinicIsoDate } from '@utilities/clinic-time';

/**
 * `/accounting/reports` — the financial reports on one screen: pick a report, set its dates (and account,
 * department or comparison), read it as a table with click-through rows, and export it to Excel or PDF.
 */
@Component({
  selector: 'app-financial-reports-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    EntitySelect,
    ErrorState,
    Skeleton,
    TextField,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSlideToggleModule,
    RouterLink,
    KeyValuePipe,
  ],
  templateUrl: './financial-reports.page.html',
})
export class FinancialReportsPage implements OnInit {
  private readonly api = inject(ReportApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly reports = REPORTS;
  protected readonly variants = ButtonVariant;
  protected readonly selected = signal<ReportDefinition>(REPORTS[0]);
  protected readonly table = signal<ReportTable | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<ApiError | null>(null);

  private readonly today = clinicIsoDate();
  protected readonly form = new FormGroup({
    asOf: new FormControl(this.today, { nonNullable: true }),
    from: new FormControl(`${this.today.slice(0, 8)}01`, { nonNullable: true }),
    to: new FormControl(this.today, { nonNullable: true }),
    accountId: new FormControl<string | null>(null),
    departmentId: new FormControl<string | null>(null),
    compare: new FormControl(false, { nonNullable: true }),
    includeZero: new FormControl(false, { nonNullable: true }),
  });

  protected readonly inputs = computed(() => this.selected().inputs);
  protected readonly trialBalance = ReportType.TrialBalance;
  protected readonly postable: FilterGroup = { and: [{ isGroup: { eq: false } }] };
  protected readonly accountName = (a: Account): string => `${a.code} · ${a.name}`;
  protected readonly departmentName = (d: Department): string => d.name;

  protected readonly cell = reportCell;
  protected readonly kind = reportKind;
  protected readonly link = reportLink;

  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type');
    const found = REPORTS.find((r) => r.type === type);
    if (found) this.selected.set(found);
    if (this.selected().inputs !== 'ledger') void this.run();
  }

  protected pick(report: ReportDefinition): void {
    this.selected.set(report);
    this.table.set(null);
    this.error.set(null);
    void this.router.navigate([], { queryParams: { type: report.type }, replaceUrl: true });
    if (report.inputs !== 'ledger' || this.form.controls.accountId.value) void this.run();
  }

  protected align(type: string): string {
    return type === 'money' || type === 'number' ? 'text-right tabular-nums' : 'text-left';
  }

  protected rowClass(row: ReportRow): string {
    switch (this.kind(row)) {
      case 'group':
        return 'bg-surface-container font-semibold';
      case 'total':
        return 'border-t-2 border-outline font-semibold';
      default:
        return '';
    }
  }

  protected readonly run = async (): Promise<void> => {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.table.set(await firstValueFrom(this.api.build(this.selected().type, this.params())));
    } catch (error) {
      this.error.set(error as ApiError);
      this.table.set(null);
    } finally {
      this.loading.set(false);
    }
  };

  protected readonly exportXlsx = (): Promise<void> => this.export('xlsx');
  protected readonly exportPdf = (): Promise<void> => this.export('pdf');

  private async export(format: 'xlsx' | 'pdf'): Promise<void> {
    await firstValueFrom(this.api.export(this.selected().type, this.params(), format));
  }

  /** The previous period of the same length, ending the day before `from`. */
  private previous(from: string, to: string): { compareFrom: string; compareTo: string } {
    const days = Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
    const compareTo = addDays(from, -1);
    return { compareFrom: addDays(compareTo, -days), compareTo };
  }

  private params(): ReportParams {
    const v = this.form.getRawValue();
    switch (this.inputs()) {
      case 'as-of':
        return this.selected().type === ReportType.TrialBalance
          ? { asOf: v.asOf, includeZero: v.includeZero }
          : { asOf: v.asOf };
      case 'ledger':
        return { accountId: v.accountId ?? undefined, from: v.from, to: v.to };
      case 'income':
        return {
          from: v.from,
          to: v.to,
          departmentId: v.departmentId,
          ...(v.compare ? this.previous(v.from, v.to) : {}),
        };
      default:
        return { from: v.from, to: v.to };
    }
  }
}

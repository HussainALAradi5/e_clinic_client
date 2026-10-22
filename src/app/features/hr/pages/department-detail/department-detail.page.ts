import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DepartmentFormDialog } from '../../components/department-form-dialog/department-form-dialog.component';
import { DepartmentFormDialogData } from '../../interfaces/dialog-data.interface';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { AuditHistory } from '@shared/components/audit-history/audit-history.component';
import { EntityActions } from '@shared/components/entity-actions/entity-actions.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Facts } from '@shared/components/facts/facts.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Department } from '@shared/interfaces/hr/department.interface';
import { Employee } from '@shared/interfaces/hr/employee.interface';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { ApiClient } from '@shared/services/api/api-client.service';
import { EntityDetail } from '@shared/services/data/entity-detail';
import { DepartmentApi } from '@shared/services/hr/department-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';

/** `/hr/departments/:id` — facts, sub-departments, staff, history; edit / archive / delete. */
@Component({
  selector: 'app-department-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    EntityActions,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    AuditHistory,
    MatCardModule,
    MatTabsModule,
    RouterLink,
    HasAccessDirective,
  ],
  templateUrl: './department-detail.page.html',
})
export class DepartmentDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(DepartmentApi);
  private readonly client = inject(ApiClient);
  protected readonly detail = new EntityDetail(this.api);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly variants = ButtonVariant;
  protected readonly staff = signal<Employee[]>([]);
  protected readonly facts = computed<Fact[]>(() => {
    const d = this.detail.record();
    if (!d) return [];
    return [
      { label: 'Code', value: d.code, mono: true },
      { label: 'Part of', value: d.parent?.name ?? 'Top level' },
      {
        label: 'Manager',
        value: d.manager ? `${d.manager.fullName} — ${d.manager.jobTitle}` : null,
      },
      { label: 'Cost center', value: d.costCenterCode, mono: true },
      { label: 'Employees', value: d.employeesCount ?? 0 },
    ];
  });

  ngOnInit(): void {
    void this.reload();
  }

  protected async reload(): Promise<void> {
    await this.detail.load(this.id());
    const page = await firstValueFrom(
      this.client.list<Employee>('hr/employees', {
        perPage: 100,
        filter: { and: [{ departmentId: { eq: this.id() } }] },
      }),
    ).catch(() => ({ data: [] as Employee[] }));
    this.staff.set(page.data);
  }

  protected readonly edit = async (): Promise<void> => {
    if (await this.openForm(this.detail.record(), (payload) => this.detail.update(payload)))
      this.notify.success('Department saved.');
  };

  protected readonly addChild = async (): Promise<void> => {
    const child = await this.openForm(
      null,
      (payload) => firstValueFrom(this.api.create(payload)),
      this.detail.record(),
    );
    if (child) {
      this.notify.success(`Department ${child.name} created.`);
      await this.reload();
    }
  };

  protected readonly archive = async (): Promise<void> => {
    await this.detail.archive();
    this.notify.success('Department archived.');
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.detail.unarchive();
    this.notify.success('Department back in pickers.');
  };

  protected readonly restore = async (): Promise<void> => {
    await this.detail.restore();
    this.notify.success('Department restored.');
  };

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success('Department deleted.');
    await this.router.navigateByUrl('/hr/departments');
  };

  private openForm(
    department: Department | null,
    save: DepartmentFormDialogData['save'],
    parent: Department | null = null,
  ): Promise<Department | undefined> {
    return this.dialogs.open<DepartmentFormDialog, DepartmentFormDialogData, Department>(
      DepartmentFormDialog,
      { department, parent, save },
      { width: '560px' },
    );
  }
}

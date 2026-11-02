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
import { DepartmentFormDialog } from '@components/hr/department-form-dialog/department-form-dialog.component';
import { DepartmentFormDialogData } from '@interfaces/hr/dialog-data.interface';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { EntityActions } from '@components/common/entity-actions/entity-actions.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Department } from '@interfaces/hr/department.interface';
import { Employee } from '@interfaces/hr/employee.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { ApiClient } from '@services/api/api-client.service';
import { EntityDetail } from '@services/data/entity-detail';
import { DepartmentApi } from '@services/hr/department-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { DEPARTMENT_DETAIL_TEXT } from '@constants/hr/department-detail.constants';

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
      { label: DEPARTMENT_DETAIL_TEXT.code, value: d.code, mono: true },
      {
        label: DEPARTMENT_DETAIL_TEXT.partOf,
        value: d.parent?.name ?? DEPARTMENT_DETAIL_TEXT.topLevel,
      },
      {
        label: DEPARTMENT_DETAIL_TEXT.manager,
        value: d.manager ? `${d.manager.fullName} — ${d.manager.jobTitle}` : null,
      },
      { label: DEPARTMENT_DETAIL_TEXT.costCenter, value: d.costCenterCode, mono: true },
      { label: DEPARTMENT_DETAIL_TEXT.employees, value: d.employeesCount ?? 0 },
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
      this.notify.success(DEPARTMENT_DETAIL_TEXT.departmentSaved);
  };

  protected readonly addChild = async (): Promise<void> => {
    const child = await this.openForm(
      null,
      (payload) => firstValueFrom(this.api.create(payload)),
      this.detail.record(),
    );
    if (child) {
      this.notify.success(DEPARTMENT_DETAIL_TEXT.departmentCreated(child.name));
      await this.reload();
    }
  };

  protected readonly archive = async (): Promise<void> => {
    await this.detail.archive();
    this.notify.success(DEPARTMENT_DETAIL_TEXT.departmentArchived);
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.detail.unarchive();
    this.notify.success(DEPARTMENT_DETAIL_TEXT.departmentBackInPickers);
  };

  protected readonly restore = async (): Promise<void> => {
    await this.detail.restore();
    this.notify.success(DEPARTMENT_DETAIL_TEXT.departmentRestored);
  };

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success(DEPARTMENT_DETAIL_TEXT.departmentDeleted);
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

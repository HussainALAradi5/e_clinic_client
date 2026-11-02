import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { ShiftFormDialog } from '@components/hr/shift-form-dialog/shift-form-dialog.component';
import { ShiftFormDialogData } from '@interfaces/hr/shift-form-dialog.interface';
import { hoursText } from '@utilities/hr/shift-hours';
import { AppButton } from '@components/common/app-button/app-button.component';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { EmployeeStatus } from '@enums/hr/employee-status.enum';
import { Employee } from '@interfaces/hr/employee.interface';
import { Shift } from '@interfaces/hr/shift.interface';
import { ShiftMember } from '@interfaces/hr/shift-member.interface';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { ApiClient } from '@services/api/api-client.service';
import { AccessService } from '@services/auth/access.service';
import { ShiftApi } from '@services/hr/shift-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';

/** The "No shift" card: people not on any shift. */
const NONE = 'none';

/**
 * `/hr/shifts` (HR and admins) — every shift as a card (code, fixed / flexible, hours, head count) beside the people on
 * the one selected. Put people on a shift by dragging them onto its card, by name with "Add someone", or with
 * "Move to…"; the "No shift" card lists who still needs one.
 */
@Component({
  selector: 'app-shift-board-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkDrag,
    CdkDragPlaceholder,
    CdkDropList,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    AppButton,
    EmptyState,
    EntitySelect,
    PageHeader,
    StatusChip,
  ],
  templateUrl: './shift-board.page.html',
  styleUrl: './shift-board.page.scss',
})
export class ShiftBoardPage implements OnInit {
  private readonly api = inject(ShiftApi);
  private readonly client = inject(ApiClient);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly access = inject(AccessService);

  protected readonly none = NONE;
  protected readonly canEdit = this.access.can('shifts.write & employees.write');
  protected readonly shifts = signal<Shift[]>([]);
  protected readonly selectedId = signal<string>(NONE);
  protected readonly detail = signal<Shift | null>(null);
  protected readonly unassigned = signal<ShiftMember[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);

  protected readonly selected = computed(
    () => this.shifts().find((s) => s.id === this.selectedId()) ?? null,
  );
  protected readonly members = computed(() =>
    this.selectedId() === NONE ? this.unassigned() : (this.detail()?.employees ?? []),
  );
  /** Drop targets: every card (dragging a person onto one puts them on it). */
  protected readonly cardIds = computed(() => [
    `card-${NONE}`,
    ...this.shifts().map((s) => `card-${s.id}`),
  ]);
  protected readonly total = computed(
    () => this.shifts().reduce((n, s) => n + (s.employeesCount ?? 0), 0) + this.unassigned().length,
  );

  /** "Add someone": any active staff member (someone on another shift moves over). */
  protected readonly addControl = new FormControl<string | null>(null);
  protected readonly addFilter: FilterGroup = { and: [{ status: { eq: EmployeeStatus.Active } }] };
  protected readonly employeeName = (e: Employee): string => e.fullName;
  protected readonly employeeDetail = (e: Employee): string =>
    [e.jobTitle, e.department?.name].filter(Boolean).join(' · ');
  protected readonly hours = hoursText;

  ngOnInit(): void {
    void this.refresh();
  }

  protected select(id: string): void {
    this.selectedId.set(id);
    void this.loadDetail();
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
  }

  // ---- moving people ----------------------------------------------------------------------------------------

  /** A person dropped on a card: onto that shift, or off their shift for "No shift". */
  protected async dropped(
    targetId: string,
    event: CdkDragDrop<unknown, unknown, ShiftMember>,
  ): Promise<void> {
    if (targetId === this.selectedId()) return;
    await this.move(event.item.data, targetId);
  }

  protected async move(member: ShiftMember, targetId: string): Promise<void> {
    const from = this.selectedId();
    await this.run(async () => {
      if (targetId === NONE) {
        await firstValueFrom(this.api.unassign(from, member.id));
        this.notify.success(`${member.fullName} is off the ${this.selected()?.name} shift.`);
      } else {
        await firstValueFrom(this.api.assign(targetId, [member.id]));
        this.notify.success(`${member.fullName} is on ${this.nameOf(targetId)} now.`);
      }
    });
  }

  protected async add(row: Employee | null): Promise<void> {
    const id = this.selectedId();
    if (!row || id === NONE) return;
    await this.run(async () => {
      await firstValueFrom(this.api.assign(id, [row.id]));
      this.notify.success(`${row.fullName} added to ${this.nameOf(id)}.`);
    });
    this.addControl.setValue(null);
  }

  // ---- shifts -----------------------------------------------------------------------------------------------

  protected readonly create = async (): Promise<void> => {
    const shift = await this.openForm(null);
    if (shift) {
      this.notify.success(`Shift ${shift.code} · ${shift.name} created.`);
      await this.refresh(shift.id);
    }
  };

  protected async edit(shift: Shift): Promise<void> {
    const saved = await this.openForm(shift);
    if (saved) {
      this.notify.success(`${saved.code} saved — the people on it follow the new hours.`);
      await this.refresh(saved.id);
    }
  }

  protected async remove(shift: Shift): Promise<void> {
    const ok = await this.dialogs.confirm({
      title: `Delete ${shift.code} · ${shift.name}?`,
      message: 'Only an empty shift can be deleted. Move its people to another shift first.',
      confirmLabel: 'Delete shift',
      danger: true,
    });
    if (!ok) return;
    await this.run(async () => {
      await firstValueFrom(this.api.remove(shift.id));
      this.notify.success(`${shift.code} deleted.`);
      this.selectedId.set(NONE);
    });
  }

  private openForm(shift: Shift | null): Promise<Shift | undefined> {
    return this.dialogs.open<ShiftFormDialog, ShiftFormDialogData, Shift>(
      ShiftFormDialog,
      {
        shift,
        save: (payload) =>
          firstValueFrom(shift ? this.api.update(shift.id, payload) : this.api.create(payload)),
      },
      { width: '520px' },
    );
  }

  // ---- loading ----------------------------------------------------------------------------------------------

  private async run(work: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    try {
      await work();
    } catch (e) {
      this.notify.error(e);
    } finally {
      this.busy.set(false);
      await this.refresh();
    }
  }

  private async refresh(select?: string): Promise<void> {
    const [page, free] = await Promise.all([
      firstValueFrom(this.api.list({ page: 1, perPage: 100, sort: ['start_time'] })),
      firstValueFrom(
        this.client.list<Employee>('hr/employees', {
          page: 1,
          perPage: 100,
          filter: {
            and: [{ status: { eq: EmployeeStatus.Active } }, { shift_id: { null: true } }],
          },
        }),
      ),
    ]).catch((e: unknown) => {
      this.notify.error(e);
      return [null, null] as const;
    });
    if (page) this.shifts.set(page.data);
    if (free) {
      this.unassigned.set(
        free.data.map((e) => ({
          id: e.id,
          code: e.code,
          fullName: e.fullName,
          avatarUrl: null,
          jobTitle: e.jobTitle,
          department: e.department?.name ?? null,
        })),
      );
    }
    if (select) this.selectedId.set(select);
    else if (this.selectedId() === NONE && this.shifts().length && !this.unassigned().length) {
      this.selectedId.set(this.shifts()[0].id);
    }
    await this.loadDetail();
    this.loading.set(false);
  }

  private async loadDetail(): Promise<void> {
    const id = this.selectedId();
    if (id === NONE) {
      this.detail.set(null);
      return;
    }
    const shift = await firstValueFrom(this.api.get(id)).catch(() => null);
    if (this.selectedId() === id) this.detail.set(shift);
  }

  private nameOf(id: string): string {
    return this.shifts().find((s) => s.id === id)?.name ?? 'the shift';
  }
}

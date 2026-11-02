import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { RoleStore } from '@services/system/roles/role.store';
import { AppButton } from '@components/common/app-button/app-button.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { AccessFlag } from '@enums/identity/access-flag.enum';
import { MatrixGroup } from '@interfaces/identity/access-matrix.interface';
import { AccessRow } from '@interfaces/identity/access-row.interface';
import { HasUnsavedChanges } from '@interfaces/ui/unsaved-changes.interface';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { FLAG_KEYS, matrixDiff, setAction, setAll, setFlag } from '@utilities/access-matrix';
import { humanise } from '@utilities/text';
import { ACCESS_MATRIX_TEXT } from '@constants/system/access-matrix.constants';

const FLAG_LABELS: Record<AccessFlag, string> = {
  [AccessFlag.ReadOwn]: ACCESS_MATRIX_TEXT.readOwn,
  [AccessFlag.ReadAll]: ACCESS_MATRIX_TEXT.readAll,
  [AccessFlag.Create]: ACCESS_MATRIX_TEXT.create,
  [AccessFlag.Write]: ACCESS_MATRIX_TEXT.write,
  [AccessFlag.Delete]: ACCESS_MATRIX_TEXT.delete,
};

/**
 * `/system/roles-permissions/:id/access` — Odoo-style grid: resource × Read own / Read all / Create / Write / Delete,
 * plus special actions as chips. Only changed rows are saved, after a summary of added / removed permissions.
 */
@Component({
  selector: 'app-access-matrix-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RoleStore],
  imports: [
    PageHeader,
    AppButton,
    Skeleton,
    ErrorState,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './access-matrix.page.html',
})
export class AccessMatrixPage implements OnInit, HasUnsavedChanges {
  readonly id = input.required<string>();

  protected readonly store = inject(RoleStore);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);

  protected readonly flags = Object.values(AccessFlag);
  protected readonly flagLabels = FLAG_LABELS;
  protected readonly flagKeys = FLAG_KEYS;
  protected readonly humanise = humanise;

  protected readonly draft = signal<AccessRow[]>([]);
  protected readonly search = signal('');
  protected readonly diff = computed(() => matrixDiff(this.store.matrix(), this.draft()));
  protected readonly dirty = computed(() => this.diff().changedRows.length > 0);
  protected readonly groups = computed<MatrixGroup[]>(() => {
    const term = this.search().trim().toLowerCase();
    const byModule = new Map<string, AccessRow[]>();
    for (const row of this.draft()) {
      if (term && !row.resource.includes(term) && !row.module.includes(term)) {
        continue;
      }
      byModule.set(row.module, [...(byModule.get(row.module) ?? []), row]);
    }
    return [...byModule.entries()].map(([module, rows]) => ({ module, rows }));
  });

  constructor() {
    // A fresh matrix from the server (load / save) resets the draft.
    effect(() => this.draft.set(this.store.matrix().map((row) => ({ ...row }))));
  }

  ngOnInit(): void {
    void this.store.load(this.id(), true);
  }

  hasUnsavedChanges(): boolean {
    return this.dirty();
  }

  protected toggleFlag(row: AccessRow, flag: AccessFlag, value: boolean): void {
    this.replace(setFlag(row, flag, value));
  }

  protected toggleAction(row: AccessRow, action: string): void {
    this.replace(setAction(row, action, !row.actions.includes(action)));
  }

  protected toggleRow(row: AccessRow): void {
    this.replace(setAll(row, !this.full(row)));
  }

  /** Column shortcut inside one module. */
  protected toggleColumn(group: MatrixGroup, flag: AccessFlag): void {
    const value = !group.rows.every((row) => row[FLAG_KEYS[flag]]);
    for (const row of group.rows) {
      this.replace(setFlag(row, flag, value));
    }
  }

  protected columnState(group: MatrixGroup, flag: AccessFlag): 'all' | 'some' | 'none' {
    const count = group.rows.filter((row) => row[FLAG_KEYS[flag]]).length;
    return count === 0 ? 'none' : count === group.rows.length ? 'all' : 'some';
  }

  protected full(row: AccessRow): boolean {
    return (
      row.readOwn &&
      row.readAll &&
      row.create &&
      row.write &&
      row.delete &&
      row.actions.length === row.availableActions.length
    );
  }

  protected discard(): void {
    this.draft.set(this.store.matrix().map((row) => ({ ...row })));
  }

  protected readonly save = async (): Promise<void> => {
    const { added, removed, changedRows } = this.diff();
    const confirmed = await this.dialogs.confirm({
      title: ACCESS_MATRIX_TEXT.saveAccessChanges,
      message:
        `${added.length} permission(s) granted, ${removed.length} removed on ${changedRows.length} resource(s). ` +
        ACCESS_MATRIX_TEXT.usersHoldingThisRoleAre,
      confirmLabel: ACCESS_MATRIX_TEXT.save,
    });
    if (!confirmed) {
      return;
    }
    await this.store.saveMatrix(changedRows);
    this.notify.success(ACCESS_MATRIX_TEXT.accessMatrixSaved);
  };

  private replace(row: AccessRow): void {
    this.draft.update((rows) => rows.map((r) => (r.resource === row.resource ? row : r)));
  }
}

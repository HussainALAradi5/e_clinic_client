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
import { RoleStore } from '../../services/role.store';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { AccessFlag } from '@shared/enums/identity/access-flag.enum';
import { MatrixGroup } from '@shared/interfaces/identity/access-matrix.interface';
import { AccessRow } from '@shared/interfaces/identity/role.interface';
import { HasUnsavedChanges } from '@shared/interfaces/ui/unsaved-changes.interface';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { FLAG_KEYS, matrixDiff, setAction, setAll, setFlag } from '@shared/utils/access-matrix';
import { humanise } from '@shared/utils/text';

const FLAG_LABELS: Record<AccessFlag, string> = {
  [AccessFlag.ReadOwn]: 'Read own',
  [AccessFlag.ReadAll]: 'Read all',
  [AccessFlag.Create]: 'Create',
  [AccessFlag.Write]: 'Write',
  [AccessFlag.Delete]: 'Delete',
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
      title: 'Save access changes?',
      message:
        `${added.length} permission(s) granted, ${removed.length} removed on ${changedRows.length} resource(s). ` +
        'Users holding this role are signed out so the new rights apply.',
      confirmLabel: 'Save',
    });
    if (!confirmed) {
      return;
    }
    await this.store.saveMatrix(changedRows);
    this.notify.success('Access matrix saved.');
  };

  private replace(row: AccessRow): void {
    this.draft.update((rows) => rows.map((r) => (r.resource === row.resource ? row : r)));
  }
}

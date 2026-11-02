import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SaveViewDialog } from './save-view-dialog/save-view-dialog.component';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { SaveViewDialogData } from '@interfaces/view/save-view-dialog-data.interface';
import { SavedView } from '@interfaces/view/saved-view.interface';
import { AccessService } from '@services/auth/access.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { SavedViewApi } from '@services/view/saved-view-api.service';
import { toViewQuery } from '@utilities/list-query';
import { SAVED_VIEWS_TEXT } from '@constants/common/saved-views.constants';

/**
 * "Views" menu of a list: own + shared saved views, save the current layout, manage views.
 * Opens the owner's default view when the list starts without URL state.
 */
@Component({
  selector: 'ui-saved-views',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatMenuModule, MatIconModule, MatDividerModule, RouterLink],
  templateUrl: './saved-views.component.html',
})
export class SavedViews implements OnInit {
  readonly resource = input.required<string>();
  readonly query = input.required<ListQuery>();
  /** Visible columns to store with the view. */
  readonly columns = input<string[]>([]);
  /** Apply the default view on start (the list has no state in the URL). */
  readonly applyDefault = input(false);

  readonly apply = output<SavedView>();

  private readonly api = inject(SavedViewApi);
  private readonly access = inject(AccessService);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);

  protected readonly views = signal<SavedView[]>([]);
  protected readonly active = signal<string | null>(null);
  protected readonly manageParams = computed(() => ({
    filter: JSON.stringify({ and: [{ resource: { eq: this.resource() } }] }),
  }));
  protected readonly activeName = computed(
    () => this.views().find((v) => v.id === this.active())?.name ?? null,
  );

  ngOnInit(): void {
    this.api.list({ perPage: 100, sort: ['name'] }, this.resource()).subscribe({
      next: (page) => {
        this.views.set(page.data);
        const preferred = page.data.find((v) => v.isDefault && v.isMine);
        if (this.applyDefault() && preferred) {
          this.select(preferred);
        }
      },
      error: () => this.views.set([]),
    });
  }

  protected select(view: SavedView): void {
    this.active.set(view.id);
    this.apply.emit(view);
  }

  protected async save(): Promise<void> {
    const data: SaveViewDialogData = {
      canShare: this.access.can(`${this.resource()}.read_all`),
      save: (payload) =>
        firstValueFrom(
          this.api.create({
            ...payload,
            resource: this.resource(),
            query: toViewQuery(this.query()),
            columns: this.columns(),
          }),
        ),
    };
    const view = await this.dialogs.open<SaveViewDialog, SaveViewDialogData, SavedView>(
      SaveViewDialog,
      data,
    );
    if (view) {
      this.views.update((list) =>
        [...list.map((v) => (view.isDefault ? { ...v, isDefault: false } : v)), view].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      this.active.set(view.id);
      this.notify.success(SAVED_VIEWS_TEXT.viewSaved(view.name));
    }
  }
}

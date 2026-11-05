import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { SavedView } from '@interfaces/view/saved-view.interface';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { SavedViewApi } from '@services/view/saved-view-api.service';
import { humanise } from '@utilities/text';
import { VIEW_LIST_TEXT } from '@constants/system/view-list.constants';

/** `/system/list-views` — own and shared saved views of every list: rename, make default, delete. */
@Component({
  selector: 'app-view-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, MatButtonModule, MatIconModule, MatTooltipModule, DatePipe],
  templateUrl: './view-list.page.html',
})
export class ViewListPage {
  private readonly api = inject(SavedViewApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);

  protected readonly text = VIEW_LIST_TEXT;
  private readonly list = viewChild.required(ResourceListPage);

  protected readonly dateFormat = DATE_FORMAT;
  protected readonly label = humanise;

  protected async rename(view: SavedView, event: Event): Promise<void> {
    event.stopPropagation();
    const name = await this.dialogs.reason({
      title: VIEW_LIST_TEXT.renameView,
      message: VIEW_LIST_TEXT.currentName(view.name),
      confirmLabel: VIEW_LIST_TEXT.rename,
    });
    if (name) {
      await this.run(this.api.update(view.id, { name }), VIEW_LIST_TEXT.viewRenamed);
    }
  }

  protected async makeDefault(view: SavedView, event: Event): Promise<void> {
    event.stopPropagation();
    await this.run(this.api.setDefault(view.id), `"${view.name}" opens by default.`);
  }

  protected async remove(view: SavedView, event: Event): Promise<void> {
    event.stopPropagation();
    const confirmed = await this.dialogs.confirm({
      title: VIEW_LIST_TEXT.delete2(view.name),
      message: view.isShared ? VIEW_LIST_TEXT.otherUsersWillNoLonger : undefined,
      confirmLabel: VIEW_LIST_TEXT.delete,
      danger: true,
    });
    if (confirmed) {
      await this.run(this.api.remove(view.id), VIEW_LIST_TEXT.viewDeleted);
    }
  }

  private async run(request: Parameters<typeof firstValueFrom>[0], message: string): Promise<void> {
    try {
      await firstValueFrom(request);
      this.notify.success(message);
      this.list().reload();
    } catch (e) {
      this.notify.error(e);
    }
  }
}

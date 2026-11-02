import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { FileScanStatus } from '@enums/attachment/file-scan-status.enum';
import { Attachment } from '@interfaces/attachment/attachment.interface';
import { AttachmentApi } from '@services/attachment/attachment-api.service';
import { TaskTracker } from '@services/task/task-tracker.service';
import { NotifyService } from '@services/ui/notify.service';
import { formatBytes, humanise } from '@utilities/text';

/** `/system/attachments` — every file in the system: download (signed link), ZIP of a selection, bulk archive / delete. */
@Component({
  selector: 'app-attachment-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResourceListPage,
    CellDef,
    AppButton,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DatePipe,
  ],
  templateUrl: './attachment-list.page.html',
})
export class AttachmentListPage {
  /** Record types arrive as aliases (`clinical_order`); shown as words. */
  protected readonly humanise = humanise;
  private readonly api = inject(AttachmentApi);
  private readonly tracker = inject(TaskTracker);
  private readonly notify = inject(NotifyService);
  private readonly list = viewChild.required(ResourceListPage);

  protected readonly dateFormat = DATE_FORMAT;
  protected readonly size = formatBytes;
  protected readonly clean = FileScanStatus.Clean;
  protected readonly picked = computed(() => this.list().selection.pickedIds());

  protected download(row: Attachment, inline: boolean, event: Event): void {
    event.stopPropagation();
    this.api.download(row.id, inline).subscribe({ error: (e: unknown) => this.notify.error(e) });
  }

  protected readonly zip = async (): Promise<void> => {
    const task = await firstValueFrom(this.api.zip(this.picked()));
    this.list().selection.clear();
    this.tracker.follow(task);
  };
}

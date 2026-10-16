import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UPLOAD_LIMITS } from '@shared/constants/limits.constants';
import { AttachmentCategory } from '@shared/enums/attachment/attachment-category.enum';
import { FileScanStatus } from '@shared/enums/attachment/file-scan-status.enum';
import { UploadStatus } from '@shared/enums/upload/upload-status.enum';
import { Attachment, AttachmentOwner } from '@shared/interfaces/attachment/attachment.interface';
import { UploadItem } from '@shared/interfaces/upload/upload.interface';
import { UploadQueue } from '@shared/services/upload/upload-queue';
import { UploadService } from '@shared/services/upload/upload.service';

/**
 * Multiple-file upload: drag & drop, browse, paste (Ctrl+V screenshots) or camera on mobile; files are checked
 * against the category rules before upload; per-file progress, cancel / retry / remove; resumable for large files.
 */
@Component({
  selector: 'ui-upload-zone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule, MatProgressBarModule, MatTooltipModule, DecimalPipe],
  host: { class: 'block', '(paste)': 'onPaste($event)' },
  templateUrl: './upload-zone.component.html',
})
export class UploadZone implements OnInit, OnDestroy {
  readonly category = input.required<AttachmentCategory | `${AttachmentCategory}`>();
  readonly owner = input.required<AttachmentOwner>();
  readonly multiple = input(true);
  readonly maxFiles = input<number>(UPLOAD_LIMITS.maxFiles);
  readonly maxFileMb = input<number>(UPLOAD_LIMITS.maxResumableBytes / 1048576);
  /** e.g. 'image/*,.pdf' — from the category rules. */
  readonly accept = input<string | null>(null);

  readonly uploaded = output<Attachment[]>();
  readonly failed = output<string[]>();

  private readonly uploads = inject(UploadService);
  protected queue?: UploadQueue;
  protected readonly status = UploadStatus;
  protected readonly scan = FileScanStatus;
  protected readonly dragging = signal(false);
  protected readonly rejected = signal<string[]>([]);

  ngOnInit(): void {
    this.queue = this.uploads.createQueue({
      category: this.category(),
      owner: this.owner(),
      accept: this.accept() ?? undefined,
      maxFiles: this.multiple() ? this.maxFiles() : 1,
      maxFileBytes: this.maxFileMb() * 1048576,
      onUploaded: (attachment) => this.uploaded.emit([attachment]),
    });
  }

  ngOnDestroy(): void {
    this.queue?.destroy();
  }

  protected onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.add(input.files);
    input.value = '';
  }

  protected onDrag(event: DragEvent, over: boolean): void {
    event.preventDefault();
    this.dragging.set(over);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.add(event.dataTransfer?.files ?? null);
  }

  protected onPaste(event: ClipboardEvent): void {
    const files = event.clipboardData?.files;
    if (files?.length) {
      event.preventDefault();
      this.add(files);
    }
  }

  protected fileIcon(item: UploadItem): string {
    const type = item.file.type;
    return type.startsWith('image/')
      ? 'image'
      : type === 'application/pdf'
        ? 'picture_as_pdf'
        : 'draft';
  }

  private add(files: FileList | null): void {
    if (!files?.length || !this.queue) {
      return;
    }
    const rejected = this.queue.add(Array.from(files));
    this.rejected.set(rejected);
    if (rejected.length) {
      this.failed.emit(rejected);
    }
  }
}

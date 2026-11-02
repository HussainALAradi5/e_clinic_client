import { computed, signal } from '@angular/core';
import { filter, map, of, Subscription } from 'rxjs';
import { UploadService } from './upload.service';
import { UPLOAD_LIMITS } from '@constants/limits.constants';
import { UploadStatus } from '@enums/upload/upload-status.enum';
import { UploadItem } from '@interfaces/upload/upload.interface';
import { UploadQueueOptions } from '@interfaces/upload/upload-queue-options.interface';
import { matchesAccept } from '@utilities/file-accept';
import { isApiError } from '@utilities/guards';

/** One UploadZone's queue (signals for the template). */
export class UploadQueue {
  private readonly _items = signal<UploadItem[]>([]);
  private readonly running = new Map<string, Subscription>();

  readonly items = this._items.asReadonly();
  readonly busy = computed(() =>
    this._items().some(
      (i) => i.status === UploadStatus.Uploading || i.status === UploadStatus.Queued,
    ),
  );
  readonly uploaded = computed(() =>
    this._items()
      .filter((i) => i.status === UploadStatus.Done)
      .map((i) => i.attachment!),
  );

  constructor(
    private readonly options: UploadQueueOptions,
    private readonly service: UploadService,
  ) {}

  /** Validates (type, size, count) before anything is sent; returns the rejection messages. */
  add(files: Iterable<File>): string[] {
    const rejected: string[] = [];
    const maxFiles = this.options.maxFiles ?? UPLOAD_LIMITS.maxFiles;
    const maxBytes = this.options.maxFileBytes ?? UPLOAD_LIMITS.maxResumableBytes;
    const active = () =>
      this._items().filter(
        (i) => i.status !== UploadStatus.Cancelled && i.status !== UploadStatus.Failed,
      ).length;

    for (const file of files) {
      if (active() >= maxFiles) {
        rejected.push(`${file.name}: at most ${maxFiles} files.`);
      } else if (file.size > maxBytes) {
        rejected.push(`${file.name}: larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
      } else if (!matchesAccept(file, this.options.accept)) {
        rejected.push(`${file.name}: file type not allowed.`);
      } else {
        this._items.update((items) => [
          ...items,
          {
            key: crypto.randomUUID(),
            file,
            status: UploadStatus.Queued,
            progress: 0,
            resumable: file.size > UPLOAD_LIMITS.maxDirectBytes,
          },
        ]);
      }
    }
    this.pump();
    return rejected;
  }

  pause(key: string): void {
    this.stop(key, UploadStatus.Paused);
  }

  resume(key: string): void {
    this.patch(key, { status: UploadStatus.Queued, error: undefined });
    this.pump();
  }

  retry(key: string): void {
    this.patch(key, { status: UploadStatus.Queued, progress: 0, error: undefined });
    this.pump();
  }

  cancel(key: string): void {
    const item = this.find(key);
    this.stop(key, UploadStatus.Cancelled);
    if (item?.sessionId) {
      this.service.cancelSession(item.sessionId);
    }
  }

  remove(key: string): void {
    this.cancel(key);
    this._items.update((items) => items.filter((i) => i.key !== key));
  }

  destroy(): void {
    this.running.forEach((sub) => sub.unsubscribe());
    this.running.clear();
  }

  private pump(): void {
    const free = UPLOAD_LIMITS.parallel - this.running.size;
    this._items()
      .filter((i) => i.status === UploadStatus.Queued)
      .slice(0, Math.max(0, free))
      .forEach((item) => this.start(item));
  }

  private start(item: UploadItem): void {
    this.patch(item.key, { status: UploadStatus.Uploading });
    const progress = (pct: number) => this.patch(item.key, { progress: pct });
    const upload$ = item.resumable
      ? this.service.resumable(
          item,
          this.options,
          (id) => this.patch(item.key, { sessionId: id }),
          progress,
        )
      : this.service.direct(item.file, this.options, progress);

    this.running.set(
      item.key,
      upload$.subscribe({
        next: (attachment) => {
          this.patch(item.key, { status: UploadStatus.Done, progress: 100, attachment });
          this.options.onUploaded?.(attachment);
        },
        error: (error: unknown) => {
          this.patch(item.key, {
            status: UploadStatus.Failed,
            error: isApiError(error) || error instanceof Error ? error.message : 'Upload failed.',
          });
          this.finish(item.key);
        },
        complete: () => this.finish(item.key),
      }),
    );
  }

  private finish(key: string): void {
    this.running.delete(key);
    this.pump();
  }

  private stop(key: string, status: UploadStatus): void {
    this.running.get(key)?.unsubscribe();
    this.running.delete(key);
    this.patch(key, { status });
    this.pump();
  }

  private find(key: string): UploadItem | undefined {
    return this._items().find((i) => i.key === key);
  }

  private patch(key: string, changes: Partial<UploadItem>): void {
    this._items.update((items) => items.map((i) => (i.key === key ? { ...i, ...changes } : i)));
  }
}

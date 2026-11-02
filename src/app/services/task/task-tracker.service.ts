import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { last } from 'rxjs';
import { isFinished, TaskApi } from './task-api.service';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { BackgroundTask } from '@interfaces/task/background-task.interface';
import { EnumService } from '@services/data/enum.service';
import { NotifyService } from '@services/ui/notify.service';

/**
 * Follows a task started by a 202 response (export, ZIP, large bulk action): an info toast now, then a toast when it
 * finishes — with "Download" when it produced a file, or "Details" when it failed.
 */
@Injectable({ providedIn: 'root' })
export class TaskTracker {
  private readonly tasks = inject(TaskApi);
  private readonly notify = inject(NotifyService);
  private readonly enums = inject(EnumService);
  private readonly router = inject(Router);

  follow(task: BackgroundTask | string, onDone?: (task: BackgroundTask) => void): void {
    const id = typeof task === 'string' ? task : task.id;
    if (typeof task !== 'string' && isFinished(task)) {
      this.finished(task, onDone);
      return;
    }

    this.notify
      .info('Running in the background — you will be notified when it finishes.', 'View')
      .subscribe(() => void this.router.navigate(['/system/background-tasks', id]));

    this.tasks
      .track(id)
      .pipe(last())
      .subscribe({
        next: (done) => this.finished(done, onDone),
        error: (e: unknown) => this.notify.error(e),
      });
  }

  private finished(task: BackgroundTask, onDone?: (task: BackgroundTask) => void): void {
    onDone?.(task);
    const label = this.enums.label('TaskType', task.type);

    if (task.status === GenericStatus.Completed) {
      const toast = this.notify.success(
        `${label} finished.`,
        task.hasResult ? 'Download' : undefined,
        10000,
      );
      if (task.hasResult) {
        toast.subscribe(() =>
          this.tasks.download(task.id).subscribe({ error: (e: unknown) => this.notify.error(e) }),
        );
      }
      return;
    }

    this.notify
      .info(`${label} stopped: ${task.errorMessage ?? 'cancelled'}.`, 'Details', 10000)
      .subscribe(() => void this.router.navigate(['/system/background-tasks', task.id]));
  }
}

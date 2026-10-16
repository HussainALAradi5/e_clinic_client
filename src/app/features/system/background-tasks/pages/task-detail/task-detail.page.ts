import { DatePipe, KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { firstValueFrom } from 'rxjs';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT, TIME_FORMAT } from '@shared/constants/app.constants';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { BackgroundTask } from '@shared/interfaces/task/background-task.interface';
import { ConfirmConfig } from '@shared/interfaces/ui/confirm-config.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { AuthStore } from '@shared/services/auth/auth.store';
import { isFinished, TaskApi } from '@shared/services/task/task-api.service';
import { humanise } from '@shared/utils/text';

/** `/system/background-tasks/:id` — live progress, result summary, Download and Cancel (owner only). */
@Component({
  selector: 'app-task-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    StatusChip,
    AppButton,
    ErrorState,
    Skeleton,
    MatCardModule,
    MatProgressBarModule,
    DatePipe,
    KeyValuePipe,
    EnumLabelPipe,
  ],
  templateUrl: './task-detail.page.html',
})
export class TaskDetailPage implements OnInit {
  /** Route parameter. */
  readonly id = input.required<string>();

  private readonly api = inject(TaskApi);
  private readonly auth = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly task = signal<BackgroundTask | null>(null);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly running = computed(() => {
    const task = this.task();
    return task !== null && !isFinished(task);
  });
  protected readonly isOwner = computed(
    () => !this.task()?.requestedBy || this.task()?.requestedBy?.id === this.auth.user()?.id,
  );
  protected readonly variants = ButtonVariant;
  protected readonly dateTimeFormat = `${DATE_FORMAT}, ${TIME_FORMAT}`;
  protected readonly label = humanise;
  protected readonly cancelConfirm: ConfirmConfig = {
    title: 'Cancel this task?',
    message: 'Work done so far is discarded.',
    confirmLabel: 'Cancel task',
    danger: true,
  };

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.error.set(null);
    this.api
      .track(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => this.task.set(task),
        error: (e: ApiError) => this.error.set(e),
      });
  }

  protected readonly download = async (): Promise<void> => {
    await firstValueFrom(this.api.download(this.id()));
  };

  protected readonly cancel = async (): Promise<void> => {
    this.task.set(await firstValueFrom(this.api.cancel(this.id())));
  };

  /** Summary value as text: scalars as is, lists joined, anything else as JSON. */
  protected display(value: unknown): string {
    if (Array.isArray(value)) {
      return value.length ? value.map((v) => this.display(v)).join(', ') : '—';
    }
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
}

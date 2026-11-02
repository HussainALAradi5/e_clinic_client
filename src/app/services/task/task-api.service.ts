import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { silent } from '@middlewares/interceptors/http-context';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { Page } from '@interfaces/api/page.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { BackgroundTask } from '@interfaces/task/background-task.interface';
import { SignedLink } from '@interfaces/task/signed-link.interface';
import { ApiClient } from '@services/api/api-client.service';
import { openSignedLink } from '@utilities/download';
import { poll } from '@utilities/poll';
import { ENDPOINTS } from '@config/endpoints';

/** Identity › Background tasks — own tasks (administrators: all). */
@Injectable({ providedIn: 'root' })
export class TaskApi {
  private readonly api = inject(ApiClient);

  list(query: ListQuery): Observable<Page<BackgroundTask>> {
    return this.api.list<BackgroundTask>(ENDPOINTS.tasks, query);
  }

  get(id: string, quiet = false): Observable<BackgroundTask> {
    return this.api.get<BackgroundTask>(
      `${ENDPOINTS.tasks}/${id}`,
      quiet ? { context: silent() } : {},
    );
  }

  cancel(id: string): Observable<BackgroundTask> {
    return this.api.post<BackgroundTask>(`${ENDPOINTS.tasks}/${id}/cancel`);
  }

  /** Requests a 5-minute signed link and starts the download. */
  download(id: string): Observable<SignedLink> {
    return this.api
      .get<SignedLink>(`${ENDPOINTS.tasks}/${id}/download`)
      .pipe(tap((link) => openSignedLink(link)));
  }

  /** Polls (with back-off, paused in hidden tabs) until the task is completed or cancelled. */
  track(id: string): Observable<BackgroundTask> {
    return poll(() => this.get(id, true), { interval: 1500, until: isFinished });
  }
}

export function isFinished(task: BackgroundTask): boolean {
  return task.status === GenericStatus.Completed || task.status === GenericStatus.Cancelled;
}

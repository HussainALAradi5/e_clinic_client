import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable } from 'rxjs';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { isApiError } from '@shared/utils/guards';

/** Toasts: success / info (3 s, optional action such as Undo) and errors with the request id for support. */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, action?: string, duration = 3000): Observable<void> {
    return this.open(message, action, duration, 'ui-toast-success');
  }

  info(message: string, action?: string, duration = 4000): Observable<void> {
    return this.open(message, action, duration, 'ui-toast-info');
  }

  error(error: ApiError | string | unknown): void {
    const message =
      typeof error === 'string'
        ? error
        : isApiError(error)
          ? error.message
          : 'Something went wrong.';
    const reference =
      isApiError(error) && error.requestId ? ` · Ref ${error.requestId.slice(0, 8)}` : '';
    this.snackBar.open(message + reference, 'Dismiss', {
      duration: 8000,
      panelClass: 'ui-toast-error',
      politeness: 'assertive',
    });
  }

  /** Emits when the user clicks the action (e.g. Undo). */
  private open(
    message: string,
    action: string | undefined,
    duration: number,
    panelClass: string,
  ): Observable<void> {
    return this.snackBar
      .open(message, action, { duration, panelClass, politeness: 'polite' })
      .onAction()
      .pipe(map(() => undefined));
  }
}

import {
  concat,
  defer,
  filter,
  fromEvent,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  take,
  timer,
} from 'rxjs';
import { PollOptions } from '@shared/interfaces/ui/poll-options.interface';

function whenVisible(): Observable<unknown> {
  if (typeof document === 'undefined') {
    return of(true);
  }
  return fromEvent(document, 'visibilitychange').pipe(
    startWith(null),
    map(() => document.visibilityState === 'visible'),
    filter(Boolean),
    take(1),
  );
}

/**
 * Polls with exponential back-off and pauses while the tab is hidden (background tasks, notifications).
 * Pass the SILENT context on the request so the global progress bar stays quiet.
 */
export function poll<T>(request: () => Observable<T>, options: PollOptions<T> = {}): Observable<T> {
  const { interval = 2000, maxInterval = 30000, until = () => false } = options;

  const tick = (delay: number): Observable<T> =>
    whenVisible().pipe(
      switchMap(() => defer(request)),
      switchMap((value) =>
        until(value)
          ? of(value)
          : concat(
              of(value),
              timer(delay).pipe(switchMap(() => tick(Math.min(delay * 2, maxInterval)))),
            ),
      ),
    );

  return tick(interval);
}

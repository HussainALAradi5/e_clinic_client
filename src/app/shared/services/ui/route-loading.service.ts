import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

/** Show the loader only for slow navigations, and then long enough not to flicker. */
const SHOW_AFTER_MS = 200;
const MIN_VISIBLE_MS = 400;

/** `active` is true while a navigation (lazy page download, guards, resolvers) is taking noticeably long. */
@Injectable({ providedIn: 'root' })
export class RouteLoadingService {
  readonly active = signal(false);

  private showTimer: ReturnType<typeof setTimeout> | undefined;
  private shownAt = 0;

  constructor() {
    inject(Router)
      .events.pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.start();
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.stop();
        }
      });
  }

  private start(): void {
    clearTimeout(this.showTimer);
    this.showTimer = setTimeout(() => {
      this.shownAt = Date.now();
      this.active.set(true);
    }, SHOW_AFTER_MS);
  }

  private stop(): void {
    clearTimeout(this.showTimer);
    if (!this.active()) {
      return;
    }
    const remaining = MIN_VISIBLE_MS - (Date.now() - this.shownAt);
    this.showTimer = setTimeout(() => this.active.set(false), Math.max(0, remaining));
  }
}

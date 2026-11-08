import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { DashboardSection } from '@enums/dashboard/dashboard-section.enum';
import { DashboardData } from '@interfaces/dashboard/dashboard-data.interface';
import { DashboardApi } from '@services/dashboard/dashboard-api.service';

/** State of one <ui-dashboard>: finds the section's default dashboard, then its figures. Provided per component. */
@Injectable()
export class DashboardStore {
  private readonly api = inject(DashboardApi);
  private request: Subscription | null = null;

  private readonly dataState = signal<DashboardData | null>(null);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<unknown>(null);

  readonly data = this.dataState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly widgets = computed(() => this.dataState()?.widgets ?? []);
  readonly isEmpty = computed(
    () => !this.loadingState() && !this.errorState() && this.widgets().length === 0,
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.request?.unsubscribe());
  }

  /** A newer load cancels the one still running. */
  load(section: DashboardSection): void {
    this.request?.unsubscribe();
    this.loadingState.set(true);
    this.errorState.set(null);
    this.request = this.fetch(section).subscribe({
      next: (data) => {
        this.dataState.set(data);
        this.loadingState.set(false);
      },
      error: (error: unknown) => {
        this.dataState.set(null);
        this.errorState.set(error);
        this.loadingState.set(false);
      },
    });
  }

  private fetch(section: DashboardSection): Observable<DashboardData | null> {
    return this.api
      .findDefault(section)
      .pipe(switchMap((dashboard) => (dashboard ? this.api.data(dashboard.id) : of(null))));
  }
}

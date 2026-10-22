import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { EmptyState } from '@shared/components/empty-state/empty-state.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { Treatment, TreatmentSession } from '@shared/interfaces/clinic/treatment.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { TreatmentApi } from '@shared/services/clinic/treatment-api.service';

/** `/portal/treatments` — treatment plans with progress and the next session; each opens to its sessions. */
@Component({
  selector: 'app-my-treatments-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    EmptyState,
    Skeleton,
    StatusChip,
    EnumLabelPipe,
  ],
  templateUrl: './treatments.page.html',
})
export class MyTreatmentsPage {
  private readonly api = inject(TreatmentApi);

  protected readonly plans = signal<Treatment[] | null>(null);
  protected readonly open = signal<string | null>(null);
  protected readonly sessions = signal<Record<string, TreatmentSession[]>>({});

  constructor() {
    firstValueFrom(this.api.list({ perPage: 50, sort: ['status', '-createdAt'] }))
      .then((page) => this.plans.set(page.data))
      .catch(() => this.plans.set([]));
  }

  protected percent(t: Treatment): number {
    return t.plannedSessions
      ? Math.round(((t.progress?.attendedSessions ?? 0) / t.plannedSessions) * 100)
      : 0;
  }

  protected async toggle(t: Treatment): Promise<void> {
    this.open.update((id) => (id === t.id ? null : t.id));
    if (this.open() === t.id && !this.sessions()[t.id]) {
      const list = await firstValueFrom(this.api.sessions(t.id)).catch(() => []);
      this.sessions.update((all) => ({ ...all, [t.id]: list }));
    }
  }
}

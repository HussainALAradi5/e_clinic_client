import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { DashboardWidgetComponent } from '@components/common/dashboard-widget/dashboard-widget.component';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { DASHBOARD_SKELETON_TILES, DASHBOARD_TEXT } from '@constants/common/dashboard.constants';
import { DashboardSection } from '@enums/dashboard/dashboard-section.enum';
import { DashboardStore } from '@services/dashboard/dashboard.store';

/**
 * A section's default dashboard, whatever the section: <ui-dashboard [section]="section" />. The server decides which
 * widgets this user receives; one column on a phone.
 */
@Component({
  selector: 'ui-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DashboardWidgetComponent, EmptyState, ErrorState, Skeleton],
  providers: [DashboardStore],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  protected readonly store = inject(DashboardStore);
  protected readonly text = DASHBOARD_TEXT;
  protected readonly skeletonTiles = DASHBOARD_SKELETON_TILES;
  protected readonly dateFormat = DATE_FORMAT;

  readonly section = input.required<DashboardSection>();

  constructor() {
    effect(() => this.store.load(this.section()));
  }

  protected reload(): void {
    this.store.load(this.section());
  }
}

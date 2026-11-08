import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DASHBOARD_WIDGET_TEXT } from '@constants/common/dashboard.constants';
import { DashboardMetricKind } from '@enums/dashboard/dashboard-metric-kind.enum';
import { DashboardWidgetData } from '@interfaces/dashboard/dashboard-widget-data.interface';

/** One tile of <ui-dashboard>: a single figure, or a titled list of rows. Spans the grid by its size. */
@Component({
  selector: 'ui-dashboard-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-size]': 'widget().size' },
  templateUrl: './dashboard-widget.component.html',
  styleUrl: './dashboard-widget.component.scss',
})
export class DashboardWidgetComponent {
  protected readonly text = DASHBOARD_WIDGET_TEXT;

  readonly widget = input.required<DashboardWidgetData>();
  protected readonly isStat = computed(() => this.widget().kind === DashboardMetricKind.Stat);
  protected readonly items = computed(() => this.widget().items ?? []);
}

import { DashboardMetricKind } from '@enums/dashboard/dashboard-metric-kind.enum';
import { DashboardWidgetSize } from '@enums/dashboard/dashboard-widget-size.enum';
import { DashboardListItem } from '@interfaces/dashboard/dashboard-list-item.interface';

/** A widget with its figure (`stat`) or rows (`list`). */
export interface DashboardWidgetData {
  metric: string;
  title: string;
  kind: DashboardMetricKind;
  size: DashboardWidgetSize;
  position: number;
  value: number | null;
  items: DashboardListItem[] | null;
}

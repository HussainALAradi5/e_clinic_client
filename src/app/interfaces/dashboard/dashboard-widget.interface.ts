import { DashboardWidgetSize } from '@enums/dashboard/dashboard-widget-size.enum';

/** One entry of a saved dashboard's `widgets`. */
export interface DashboardWidget {
  metric: string;
  title: string | null;
  size: DashboardWidgetSize;
  position: number;
}

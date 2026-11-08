import { DashboardWidgetData } from '@interfaces/dashboard/dashboard-widget-data.interface';

/** Mirror of App\Http\Resources\Dashboards\DashboardDataResource: only the widgets this user may see. */
export interface DashboardData {
  dashboardId: string;
  date: string;
  widgets: DashboardWidgetData[];
}

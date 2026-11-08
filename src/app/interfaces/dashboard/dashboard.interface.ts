import { DashboardSection } from '@enums/dashboard/dashboard-section.enum';
import { DashboardWidget } from '@interfaces/dashboard/dashboard-widget.interface';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';

/** Mirror of App\Http\Resources\Dashboards\DashboardResource. */
export interface Dashboard extends GenericEntity {
  name: string;
  description: string | null;
  section: DashboardSection;
  isDefault: boolean;
  widgets: DashboardWidget[];
}

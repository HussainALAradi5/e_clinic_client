import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ActivityLog } from '@components/common/activity-log/activity-log.component';
import { ACTIVITY_LOG_TEXT } from '@constants/common/activity-log.constants';
import { ActivityRouteData } from '@interfaces/identity/activity-route-data.interface';
import { AccessService } from '@services/auth/access.service';

/**
 * The event log below a record page. A route opts in with `data: activityLogRoute('appointment', 'appointments.read_all')`,
 * which also says who sees it there.
 */
@Component({
  selector: 'app-page-activity',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActivityLog, MatCardModule],
  host: { class: 'block' },
  templateUrl: './page-activity.component.html',
})
export class PageActivity {
  protected readonly text = ACTIVITY_LOG_TEXT;

  private readonly router = inject(Router);
  private readonly access = inject(AccessService);

  private readonly route = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.deepestRoute()),
    ),
    { requireSync: true },
  );

  protected readonly target = computed(() => {
    const route = this.route();
    const log = route.data['activityLog'] as ActivityRouteData | undefined;
    const recordId = route.paramMap.get('id');
    return log && recordId && this.access.can(log.access) ? { entity: log.entity, recordId } : null;
  });

  private deepestRoute(): ActivatedRouteSnapshot {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterOutlet } from '@angular/router';
import { PageLoader } from '@components/common/page-loader/page-loader.component';
import { LoadingService } from '@services/ui/loading.service';
import { RouteLoadingService } from '@services/ui/route-loading.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MatProgressBarModule, PageLoader],
  templateUrl: './app.html',
})
export class App {
  /** API requests in flight: thin bar on top of the current page. */
  protected readonly loading = inject(LoadingService);
  /** Slow page changes: the full-screen loader replaces the page. */
  protected readonly routeLoading = inject(RouteLoadingService);
}

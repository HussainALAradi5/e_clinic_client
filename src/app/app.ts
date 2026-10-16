import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from '@shared/services/ui/loading.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MatProgressBarModule],
  templateUrl: './app.html',
})
export class App {
  protected readonly loading = inject(LoadingService);
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { EmptyState } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, MatButtonModule, RouterLink],
  templateUrl: './not-found.page.html',
})
export class NotFoundPage {}

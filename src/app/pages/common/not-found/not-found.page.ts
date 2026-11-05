import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { NOT_FOUND_TEXT } from '@constants/common/not-found.constants';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, MatButtonModule, RouterLink],
  templateUrl: './not-found.page.html',
})
export class NotFoundPage {
  protected readonly text = NOT_FOUND_TEXT;
}

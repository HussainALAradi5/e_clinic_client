import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { FORBIDDEN_TEXT } from '@constants/common/forbidden.constants';

@Component({
  selector: 'app-forbidden-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, MatButtonModule, RouterLink],
  templateUrl: './forbidden.page.html',
})
export class ForbiddenPage {
  protected readonly text = FORBIDDEN_TEXT;
}

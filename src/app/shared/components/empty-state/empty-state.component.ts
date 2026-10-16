import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Empty state with the primary action projected: <ui-empty title="No rooms yet"><ui-button>New room</ui-button></ui-empty> */
@Component({
  selector: 'ui-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyState {
  readonly title = input('Nothing here yet');
  readonly message = input<string | null>(null);
  readonly icon = input('inbox');
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Title, subtitle, optional status and actions:
 * <ui-page-header title="Rooms"><ui-button actions …>New room</ui-button></ui-page-header>
 */
@Component({
  selector: 'ui-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './page-header.component.html',
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}

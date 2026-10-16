import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Full-screen loading state: the beating clinic cross over a heartbeat line. Same markup and CSS (styles/_brand.scss)
 * as the boot splash in index.html, so the hand-over from boot to the first page is seamless.
 */
@Component({
  selector: 'ui-page-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-loader', role: 'status', 'aria-live': 'polite' },
  templateUrl: './page-loader.component.html',
})
export class PageLoader {
  readonly label = input('Loading');
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The dark pine brand surface (website hero, sign-in panel, dashboard banner, hub headers) with its clinic-cross
 * decoration: `corner` = one large cross off the corner, `field` = a faint field of small crosses, `none`.
 */
@Component({
  selector: 'ui-brand-surface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'brand-surface' },
  templateUrl: './brand-surface.component.html',
})
export class BrandSurface {
  readonly mark = input<'corner' | 'field' | 'none'>('corner');
  protected readonly grid = [0, 1, 2, 3, 4, 5, 6, 7];
}

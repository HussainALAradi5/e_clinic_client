import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BRAND_MARK_TEXT } from '@constants/common/brand-mark.constants';

/** e-Clinic logo: a rounded cross mark and the name. `tone="light"` for dark backgrounds. */
@Component({
  selector: 'ui-brand-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center gap-2.5' },
  templateUrl: './brand-mark.component.html',
})
export class BrandMark {
  protected readonly text = BRAND_MARK_TEXT;

  readonly tone = input<'dark' | 'light'>('dark');
  readonly size = input<'md' | 'lg'>('md');
}

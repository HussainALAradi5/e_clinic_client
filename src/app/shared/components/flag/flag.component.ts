import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * `<ui-flag code="BH" />` — the country's flag as an SVG image (flag-icons, see styles/_flags.scss), so it shows on every system; Windows has
 * no flag emoji and would print the letters. Decorative unless a `label` is given.
 */
@Component({
  selector: 'ui-flag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0 align-middle' },
  templateUrl: './flag.component.html',
  styleUrl: './flag.component.scss',
})
export class Flag {
  readonly code = input.required<string | null | undefined>();
  readonly label = input<string | null>(null);

  protected readonly css = computed(() => {
    const code = this.code()?.toLowerCase();
    return code && /^[a-z]{2}$/.test(code) ? `flag fi-${code}` : null;
  });
}

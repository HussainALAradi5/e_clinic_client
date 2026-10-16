import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Loading placeholder shaped like the content: `rows` bars (table rows) or a block. */
@Component({
  selector: 'ui-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', 'aria-busy': 'true', 'aria-label': 'Loading' },
  templateUrl: './skeleton.component.html',
})
export class Skeleton {
  readonly rows = input(3);
  readonly height = input(16);
  protected readonly rowList = computed(() =>
    Array.from({ length: this.rows() }, (_, i) =>
      i === this.rows() - 1 && i > 0 ? '60%' : '100%',
    ),
  );
}

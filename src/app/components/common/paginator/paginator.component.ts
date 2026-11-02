import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageMeta } from '@interfaces/api/page-meta.interface';
import { PageChange } from '@interfaces/ui/page-change.interface';

/**
 * Page mode: "1–25 of 1,284", first / previous / next / last, go to page, per page 10/25/50/100.
 * Cursor mode (append-only logs): previous / next only. Keyboard: `[` / `]`.
 */
@Component({
  selector: 'ui-paginator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatSelectModule, MatTooltipModule, FormsModule],
  host: { class: 'block', '(document:keydown)': 'onKey($event)' },
  templateUrl: './paginator.component.html',
})
export class Paginator {
  readonly meta = input.required<PageMeta>();
  readonly pageSizes = input<number[]>([10, 25, 50, 100]);
  readonly pageChange = output<PageChange>();

  protected readonly cursorMode = computed(() => this.meta().total === undefined);
  protected readonly page = computed(() => this.meta().currentPage ?? 1);
  protected readonly lastPage = computed(() => Math.max(1, this.meta().lastPage ?? 1));
  protected readonly range = computed(() => {
    const { perPage, total = 0 } = this.meta();
    if (total === 0) {
      return '0 of 0';
    }
    const from = (this.page() - 1) * perPage + 1;
    const to = Math.min(this.page() * perPage, total);
    return `${from.toLocaleString('en-GB')}–${to.toLocaleString('en-GB')} of ${total.toLocaleString('en-GB')}`;
  });

  protected go(page: number): void {
    this.change({
      page: Math.min(Math.max(1, page), this.lastPage()),
      perPage: this.meta().perPage,
    });
  }

  protected jump(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isInteger(value)) {
      this.go(value);
    }
  }

  protected change(change: PageChange): void {
    this.pageChange.emit(change);
  }

  protected onKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (
      target?.closest('input, textarea, [contenteditable], mat-select') ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }
    if (event.key === '[') {
      this.cursorMode()
        ? this.meta().prevCursor &&
          this.change({ perPage: this.meta().perPage, cursor: this.meta().prevCursor! })
        : this.go(this.page() - 1);
    } else if (event.key === ']') {
      this.cursorMode()
        ? this.meta().nextCursor &&
          this.change({ perPage: this.meta().perPage, cursor: this.meta().nextCursor! })
        : this.go(this.page() + 1);
    }
  }
}

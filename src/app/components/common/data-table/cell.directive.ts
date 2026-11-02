import { Directive, inject, input, TemplateRef } from '@angular/core';
import { CellContext } from '@interfaces/ui/cell-context.interface';

/** `uiCell="row_actions"` adds a last column of buttons for each row (clicks there never open the row). */
export const ROW_ACTIONS = 'row_actions';

/**
 * Custom cell: <ng-template uiCell="status" let-row><ui-status … /></ng-template>
 * Rows are API data shaped per resource, so the row type defaults to `any` inside cell templates.
 */
@Directive({ selector: 'ng-template[uiCell]' })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class CellDef<T = any> {
  readonly uiCell = input.required<string>();
  readonly template = inject<TemplateRef<CellContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(_dir: CellDef<T>, ctx: unknown): ctx is CellContext<T> {
    return true;
  }
}

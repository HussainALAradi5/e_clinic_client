import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { BULK_ACTION_ICONS } from '@shared/constants/bulk-action-icons.constants';
import { BulkResult } from '@shared/interfaces/bulk/bulk.interface';
import { BulkActionDef } from '@shared/interfaces/list/resource-schema.interface';
import { BulkService } from '@shared/services/data/bulk.service';
import { ListSelection } from '@shared/utils/list-selection';
import { humanise } from '@shared/utils/text';

/**
 * Slides in when rows are selected: count, clear, one locking AppButton per permitted bulk action
 * (dry run → confirm → run → toast with Undo).
 */
@Component({
  selector: 'ui-bulk-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButton, MatButtonModule, MatIconModule],
  host: { class: 'block' },
  templateUrl: './bulk-action-bar.component.html',
})
export class BulkActionBar {
  /** API path of the resource, e.g. 'clinic/rooms' (POST {endpoint}/bulk). */
  readonly endpoint = input.required<string>();
  readonly selection = input.required<ListSelection>();
  readonly actions = input.required<BulkActionDef[]>();
  readonly completed = output<BulkResult>();

  private readonly bulk = inject(BulkService);
  protected readonly label = humanise;

  protected icon(name: string): string | null {
    return BULK_ACTION_ICONS[name] ?? null;
  }

  protected run(action: BulkActionDef): () => Promise<void> {
    return async () => {
      const result = await this.bulk.execute(this.endpoint(), action, this.selection());
      if (result) {
        this.selection().clear();
        this.completed.emit(result);
      }
    };
  }
}

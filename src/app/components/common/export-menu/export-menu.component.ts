import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EXPORT_FORMAT_OPTIONS } from '@constants/transfer.constants';
import { ExportFormat } from '@enums/list/export-format.enum';
import { EXPORT_MENU_TEXT } from '@constants/common/export-menu.constants';

/**
 * "Export" button with a format menu (Excel / PDF / CSV, as the server offers them to this user). Says how many rows
 * are selected; with none selected the whole filtered list is exported. One export at a time.
 */
@Component({
  selector: 'ui-export-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule],
  templateUrl: './export-menu.component.html',
})
export class ExportMenu {
  protected readonly text = EXPORT_MENU_TEXT;

  readonly formats = input.required<ExportFormat[]>();
  readonly selectedCount = input(0);
  /** Runs the export; the button shows a spinner until it settles. */
  readonly run = input.required<(format: ExportFormat) => Promise<void>>();

  protected readonly busy = signal(false);
  protected readonly options = computed(() =>
    EXPORT_FORMAT_OPTIONS.filter((o) => this.formats().includes(o.format)),
  );
  protected readonly label = computed(() =>
    this.selectedCount() > 0
      ? EXPORT_MENU_TEXT.exportSelected(this.selectedCount().toLocaleString('en-GB'))
      : EXPORT_MENU_TEXT.export,
  );

  protected async choose(format: ExportFormat): Promise<void> {
    this.busy.set(true);
    try {
      await this.run()(format);
    } finally {
      this.busy.set(false);
    }
  }
}

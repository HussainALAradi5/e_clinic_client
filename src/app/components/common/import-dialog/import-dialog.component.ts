import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AppButton } from '@components/common/app-button/app-button.component';
import { IMPORT_ACCEPT } from '@constants/transfer.constants';
import { ErrorCode } from '@enums/api/error-code.enum';
import { ImportDialogData } from '@interfaces/list/import-dialog-data.interface';
import { ImportResult } from '@interfaces/list/import-result.interface';
import { ImportRowError } from '@interfaces/list/import-row-error.interface';
import { TransferApi } from '@services/data/transfer-api.service';
import { isApiError } from '@utilities/guards';

/**
 * Excel import: download the template, pick the filled-in file, import it in one request. When the server rejects
 * rows nothing is saved and every problem is listed by row and column, so the user fixes the file and tries again.
 */
@Component({
  selector: 'ui-import-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, AppButton],
  templateUrl: './import-dialog.component.html',
  styleUrl: './import-dialog.component.scss',
})
export class ImportDialog {
  protected readonly data = inject<ImportDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ImportDialog, ImportResult>);
  private readonly api = inject(TransferApi);

  protected readonly accept = IMPORT_ACCEPT;
  protected readonly file = signal<File | null>(null);
  protected readonly dragging = signal(false);
  protected readonly problem = signal<string | null>(null);
  protected readonly rowErrors = signal<ImportRowError[]>([]);
  protected readonly hiddenErrors = signal(0);

  protected readonly downloadTemplate = (): Promise<void> =>
    firstValueFrom(this.api.template(this.data.endpoint));

  protected readonly import = async (): Promise<void> => {
    const file = this.file();
    if (!file) {
      return;
    }
    this.clearProblems();
    try {
      this.ref.close(await firstValueFrom(this.api.import(this.data.endpoint, file)));
    } catch (error) {
      this.show(error);
    }
  };

  protected pick(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setFile(input.files?.[0] ?? null);
    input.value = '';
  }

  protected drop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.setFile(event.dataTransfer?.files[0] ?? null);
  }

  protected setFile(file: File | null): void {
    this.clearProblems();
    if (file && !file.name.toLowerCase().endsWith('.xlsx')) {
      this.problem.set('Choose an Excel file (.xlsx) — start from the template.');
      return;
    }
    this.file.set(file);
  }

  protected size(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${Math.ceil(bytes / 1024)} KB`
      : `${(bytes / 1048576).toFixed(1)} MB`;
  }

  private show(error: unknown): void {
    if (!isApiError(error)) {
      this.problem.set('Something went wrong. Please try again.');
      return;
    }
    this.problem.set(error.message);
    if (error.code === ErrorCode.ImportFailed) {
      const rows = (error.meta?.['rows'] as ImportRowError[] | undefined) ?? [];
      this.rowErrors.set(rows);
      this.hiddenErrors.set(
        Math.max(0, Number(error.meta?.['error_count'] ?? rows.length) - rows.length),
      );
    }
  }

  private clearProblems(): void {
    this.problem.set(null);
    this.rowErrors.set([]);
    this.hiddenErrors.set(0);
  }
}

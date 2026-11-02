import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CodeDialogData } from '@interfaces/portal/dialog-data.interface';
import { CodeImage } from '@components/common/code-image/code-image.component';

/** Full-size QR on white (scanners need contrast in dark mode too), with what it is for. */
@Component({
  selector: 'app-code-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, CodeImage],
  templateUrl: './code-dialog.component.html',
})
export class CodeDialog {
  protected readonly data = inject<CodeDialogData>(MAT_DIALOG_DATA);
}

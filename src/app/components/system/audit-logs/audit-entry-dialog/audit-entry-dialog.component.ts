import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AuditChanges } from '@components/common/audit-changes/audit-changes.component';
import { DATE_FORMAT, TIME_FORMAT } from '@constants/app.constants';
import { AuditLog } from '@interfaces/identity/audit-log.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { AUDIT_ENTRY_DIALOG_TEXT } from '@constants/system/audit-entry-dialog.constants';

/** Who did what, when and from where — with the changed values. */
@Component({
  selector: 'app-audit-entry-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, AuditChanges, DatePipe, EnumLabelPipe],
  templateUrl: './audit-entry-dialog.component.html',
})
export class AuditEntryDialog {
  protected readonly text = AUDIT_ENTRY_DIALOG_TEXT;

  protected readonly entry = inject<AuditLog>(MAT_DIALOG_DATA);
  protected readonly dateTimeFormat = `${DATE_FORMAT}, ${TIME_FORMAT}:ss`;
}

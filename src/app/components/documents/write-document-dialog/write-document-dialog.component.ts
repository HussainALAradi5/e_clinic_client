import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { DocumentActions } from '@components/documents/document-actions/document-actions.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { RichTextEditor } from '@components/documents/rich-text-editor/rich-text-editor.component';
import { DocumentFeeNote } from '@components/documents/document-fee-note/document-fee-note.component';
import { WRITE_DOCUMENT_DIALOG_TEXT } from '@constants/documents/write-document-dialog.constants';
import { DocumentType } from '@enums/documents/document-type.enum';
import { WrittenDocumentKind } from '@enums/documents/written-document-kind.enum';
import { WriteDocumentDialogData } from '@interfaces/documents/write-document-dialog-data.interface';
import { WrittenDocument } from '@interfaces/documents/written-document.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { EnumService } from '@services/data/enum.service';
import { WriteDocumentStore } from '@services/documents/write-document.store';

/**
 * The visit's provider writes a document from the session: picks the kind and a template (ready-made, own, or a
 * blank page) — filled from the visit at once — edits it in the rich-text editor, can "Auto generate" again, and
 * saves. A nurse writes attendance certificates only.
 */
@Component({
  selector: 'app-write-document-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DocumentActions,
    EnumLabelPipe,
    GenericForm,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RichTextEditor,
    TextField,
    DocumentFeeNote,
  ],
  providers: [WriteDocumentStore],
  templateUrl: './write-document-dialog.component.html',
})
export class WriteDocumentDialog implements OnInit {
  protected readonly data = inject<WriteDocumentDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<WriteDocumentDialog, WrittenDocument>);
  protected readonly store = inject(WriteDocumentStore);
  private readonly enums = inject(EnumService);

  protected readonly text = WRITE_DOCUMENT_DIALOG_TEXT;
  protected readonly documentType = DocumentType;
  protected readonly kinds = computed(() =>
    this.data.nurseOnly
      ? [WrittenDocumentKind.AttendanceCertificate]
      : this.enums.options('WrittenDocumentKind').map((o) => o.value as WrittenDocumentKind),
  );

  ngOnInit(): void {
    void this.store.load(this.data.appointmentId, this.data.nurseOnly);
  }

  /** Saves and stays open on the "saved" panel, whose Open PDF / Download are fresh clicks (no popup blocking). */
  protected readonly submit = (): Promise<WrittenDocument> => this.store.save();
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { RichTextEditor } from '@components/documents/rich-text-editor/rich-text-editor.component';
import { DOCUMENT_TEMPLATES_TEXT } from '@constants/documents/document-templates.constants';
import { WrittenDocumentKind } from '@enums/documents/written-document-kind.enum';
import { DocumentTemplate } from '@interfaces/documents/document-template.interface';
import { TemplateDialogData } from '@interfaces/documents/template-dialog-data.interface';
import { DocumentTemplateApi } from '@services/documents/document-template-api.service';

/** Writes a template from scratch or changes one of the user's own: name, description, kind and rich-text wording. */
@Component({
  selector: 'app-template-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GenericForm, MatDialogModule, RichTextEditor, SelectField, TextField],
  templateUrl: './template-dialog.component.html',
})
export class TemplateDialog {
  protected readonly data = inject<TemplateDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<TemplateDialog, DocumentTemplate>);
  private readonly api = inject(DocumentTemplateApi);

  protected readonly text = DOCUMENT_TEMPLATES_TEXT;
  protected readonly form = new FormGroup({
    name: new FormControl(this.data.template?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    description: new FormControl<string | null>(this.data.template?.description ?? null, [
      Validators.maxLength(255),
    ]),
    kind: new FormControl(this.data.template?.kind ?? WrittenDocumentKind.MedicalReport, {
      nonNullable: true,
    }),
    body: new FormControl(this.data.template?.body ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly submit = async (): Promise<DocumentTemplate> => {
    const v = this.form.getRawValue();
    const payload = { ...v, name: v.name.trim(), description: v.description?.trim() || null };
    const id = this.data.template?.id;
    const saved = await firstValueFrom(
      id ? this.api.update(id, payload) : this.api.create(payload),
    );
    this.ref.close(saved);
    return saved;
  };
}

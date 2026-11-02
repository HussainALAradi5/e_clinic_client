import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { SaveViewDialogData } from '@interfaces/view/save-view-dialog-data.interface';
import { SavedView } from '@interfaces/view/saved-view.interface';

/** Saves the current filters, sort and columns of a list as a named view. */
@Component({
  selector: 'ui-save-view-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatCheckboxModule, ReactiveFormsModule, GenericForm, TextField],
  templateUrl: './save-view-dialog.component.html',
})
export class SaveViewDialog {
  protected readonly data = inject<SaveViewDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<SaveViewDialog, SavedView>);

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    isShared: new FormControl(false, { nonNullable: true }),
    isDefault: new FormControl(false, { nonNullable: true }),
  });

  private saved: SavedView | undefined;

  protected readonly submit = async (): Promise<SavedView> => {
    const { name, isShared, isDefault } = this.form.getRawValue();
    this.saved = await this.data.save({
      name: name.trim(),
      isShared: this.data.canShare && isShared,
      isDefault,
    });
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}

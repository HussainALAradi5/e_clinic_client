import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { TreatmentDialogData } from '../../interfaces/dialog-data.interface';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { TreatmentPriority } from '@shared/enums/clinic/treatment-priority.enum';
import { Treatment } from '@shared/interfaces/clinic/treatment.interface';
import { TreatmentApi } from '@shared/services/clinic/treatment-api.service';

/** Re-prioritise an open plan; the reason is kept in the audit trail and the queue re-sorts. */
@Component({
  selector: 'app-priority-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, SelectField, TextField],
  templateUrl: './priority-dialog.component.html',
})
export class PriorityDialog {
  protected readonly data = inject<TreatmentDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<PriorityDialog, Treatment>);
  private readonly api = inject(TreatmentApi);

  protected readonly form = new FormGroup({
    priority: new FormControl<TreatmentPriority>(this.data.treatment.priority, {
      nonNullable: true,
    }),
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });

  protected readonly submit = async (): Promise<Treatment> => {
    const v = this.form.getRawValue();
    const saved = await firstValueFrom(
      this.api.changePriority(this.data.treatment.id, v.priority, v.reason.trim()),
    );
    this.ref.close(saved);
    return saved;
  };
}

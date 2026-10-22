import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { OrderDialogData } from '../../interfaces/dialog-data.interface';
import { resultCategory } from '../../utils/clinical';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { UploadZone } from '@shared/components/upload-zone/upload-zone.component';
import {
  ClinicalOrderType,
  IMAGING_ORDER_TYPES,
} from '@shared/enums/clinic/clinical-order-type.enum';
import { Attachment } from '@shared/interfaces/attachment/attachment.interface';
import { ClinicalOrder } from '@shared/interfaces/clinic/clinical-order.interface';
import { ClinicalOrderApi } from '@shared/services/clinic/clinical-order-api.service';

/**
 * Record the result: images / files (uploaded straight to the order), the report and whether it is abnormal — an
 * abnormal result alerts the ordering doctor at once. Imaging needs at least one image.
 */
@Component({
  selector: 'app-order-result-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    GenericForm,
    TextField,
    UploadZone,
  ],
  templateUrl: './order-result-dialog.component.html',
})
export class OrderResultDialog {
  protected readonly data = inject<OrderDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<OrderResultDialog, ClinicalOrder>);
  private readonly api = inject(ClinicalOrderApi);

  protected readonly order = this.data.order;
  protected readonly owner = { type: 'clinical_order', id: this.order.id };
  protected readonly category = resultCategory(this.order.type);
  protected readonly referral = this.order.type === ClinicalOrderType.Referral;
  protected readonly needsImage = IMAGING_ORDER_TYPES.includes(this.order.type);
  protected readonly files = signal(this.order.attachments?.length ?? 0);
  protected readonly blocked = computed(() => this.needsImage && this.files() === 0);
  protected readonly form = new FormGroup({
    report: new FormControl(this.order.report ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(10000)],
    }),
    isAbnormal: new FormControl(false, { nonNullable: true }),
  });

  protected uploaded(files: Attachment[]): void {
    this.files.update((n) => n + files.length);
  }

  protected readonly submit = async (): Promise<ClinicalOrder> => {
    const v = this.form.getRawValue();
    const saved = await firstValueFrom(
      this.api.complete(this.order.id, {
        report: v.report.trim(),
        isAbnormal: this.referral ? null : v.isAbnormal,
      }),
    );
    this.ref.close(saved);
    return saved;
  };
}

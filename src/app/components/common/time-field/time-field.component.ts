import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TimePickerDialog } from '@components/common/time-picker-dialog/time-picker-dialog.component';
import { TIME_FIELD_TEXT } from '@constants/ui/time-field.constants';
import { TimePickerDialogData } from '@interfaces/ui/time-picker-dialog-data.interface';
import { DialogService } from '@services/ui/dialog.service';
import { ClockTimes } from '@utilities/clock-time';
import { errorMessage } from '@validations/validators';

/**
 * A time of day shown on the 12-hour clock ("9:00 AM") and picked with the user's picker — wheels (iPhone) or a
 * clock dial (Android). The control keeps "HH:mm", as the API takes it. `ui-text type="time"` renders this.
 */
@Component({
  selector: 'ui-time-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './time-field.component.html',
})
export class TimeField {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl>();
  readonly hint = input<string | null>(null);

  private readonly dialogs = inject(DialogService);
  protected readonly text = TIME_FIELD_TEXT;

  protected shown(): string {
    return ClockTimes.label(this.control().value as string | null);
  }

  protected error(): string | null {
    return this.control().touched ? errorMessage(this.control().errors, this.label()) : null;
  }

  protected async pick(): Promise<void> {
    const control = this.control();
    if (control.disabled) {
      return;
    }
    const value = await this.dialogs.open<TimePickerDialog, TimePickerDialogData, string>(
      TimePickerDialog,
      {
        label: this.label(),
        value: control.value as string | null,
        clearable: !control.hasError('required') && !!control.value,
      },
      { width: '360px' },
    );
    control.markAsTouched();
    if (value !== undefined) {
      control.setValue(value || null);
      control.markAsDirty();
    }
  }
}

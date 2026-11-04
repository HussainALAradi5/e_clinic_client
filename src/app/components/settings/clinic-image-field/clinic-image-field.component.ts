import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CLINIC_PROFILE_TEXT } from '@constants/system/clinic-profile.constants';
import { ClinicImage } from '@enums/reference/clinic-image.enum';

/** One clinic image (logo or stamp): preview on white paper, Upload / Replace and Remove. */
@Component({
  selector: 'app-clinic-image-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './clinic-image-field.component.html',
})
export class ClinicImageField {
  readonly image = input.required<ClinicImage>();
  readonly url = input<string | null>(null);
  readonly busy = input(false);
  readonly chosen = output<File>();
  readonly removed = output<void>();

  protected readonly text = CLINIC_PROFILE_TEXT;

  protected pick(input: HTMLInputElement): void {
    const file = input.files?.[0];
    input.value = '';
    if (file) {
      this.chosen.emit(file);
    }
  }
}

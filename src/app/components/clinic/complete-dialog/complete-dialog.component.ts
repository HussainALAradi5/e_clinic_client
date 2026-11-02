import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { AppointmentDialogData } from '@interfaces/clinic/appointment-dialog-data.interface';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { BillableService } from '@interfaces/billing/billable-service.interface';
import { EnumOption } from '@interfaces/common/enum-option.interface';
import { AppointmentApi } from '@services/clinic/appointment-api.service';
import { formatMoney } from '@utilities/money';

/** Close a visit: extra services performed (charged with the visit) and an optional follow-up suggestion. */
@Component({
  selector: 'app-complete-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    GenericForm,
    SelectField,
    EntitySelect,
  ],
  templateUrl: './complete-dialog.component.html',
})
export class CompleteDialog {
  protected readonly data = inject<AppointmentDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<CompleteDialog, Appointment>);
  private readonly api = inject(AppointmentApi);

  protected readonly extras = signal<BillableService[]>([]);
  protected readonly picker = new FormControl<string | null>(null);
  protected readonly form = new FormGroup({ followUpInDays: new FormControl<number | null>(null) });
  protected readonly followUps: EnumOption[] = [3, 7, 14, 30, 90].map((d) => ({
    value: d,
    label:
      d < 14
        ? `In ${d} days`
        : `In ${d / 7 >= 4 ? Math.round(d / 30) + ' month' + (d >= 60 ? 's' : '') : d / 7 + ' weeks'}`,
  }));
  protected readonly serviceName = (s: BillableService): string =>
    `${s.name} — ${formatMoney(s.price)}`;
  protected readonly serviceCode = (s: BillableService): string => s.code;
  private saved: Appointment | undefined;

  protected add(service: BillableService | null): void {
    if (service && !this.extras().some((s) => s.id === service.id)) {
      this.extras.set([...this.extras(), service]);
    }
    this.picker.setValue(null);
  }

  protected removeExtra(id: string): void {
    this.extras.set(this.extras().filter((s) => s.id !== id));
  }

  protected readonly submit = async (): Promise<Appointment> => {
    this.saved = await firstValueFrom(
      this.api.complete(this.data.appointment.id, {
        billableServiceIds: this.extras().map((s) => s.id),
        followUpInDays: this.form.controls.followUpInDays.value,
      }),
    );
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}

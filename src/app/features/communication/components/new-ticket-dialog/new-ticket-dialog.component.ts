import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { TreatmentPriority } from '@shared/enums/clinic/treatment-priority.enum';
import { TicketCategory } from '@shared/enums/communication/ticket.enum';
import { SupportTicket } from '@shared/interfaces/communication/ticket.interface';
import { TicketApi } from '@shared/services/communication/ticket-api.service';

/** Open a support ticket: what is wrong, what kind of problem and how urgent. Closes with the new ticket. */
@Component({
  selector: 'app-new-ticket-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatIconModule, GenericForm, TextField, SelectField],
  template: `
    <h2 mat-dialog-title class="flex items-center gap-2">
      <mat-icon>support_agent</mat-icon>New support ticket
    </h2>
    <mat-dialog-content>
      <p class="mt-0 mb-4 text-sm text-on-surface-variant">
        The support team is told right away; you get a notification when it is picked up and when it
        is solved.
      </p>
      <ui-form
        [form]="form"
        [submit]="save"
        submitLabel="Open ticket"
        submitIcon="send"
        lock="once"
        [compact]="true"
        (cancelled)="ref.close()"
      >
        <ui-text
          label="Subject"
          hint="e.g. Label printer in ward 2 is offline"
          [maxLength]="150"
          [control]="form.controls.subject"
          [autofocus]="true"
        />
        <div class="grid gap-x-4 sm:grid-cols-2">
          <ui-select
            label="Category"
            enum="TicketCategory"
            [control]="form.controls.category"
            [required]="true"
          />
          <ui-select
            label="Priority"
            enum="TreatmentPriority"
            [control]="form.controls.priority"
            [required]="true"
          />
        </div>
        <ui-text
          label="What happened?"
          hint="Where, since when, what you already tried"
          [multiline]="true"
          [rows]="5"
          [maxLength]="5000"
          [control]="form.controls.description"
        />
      </ui-form>
    </mat-dialog-content>
  `,
})
export class NewTicketDialog {
  protected readonly ref = inject(MatDialogRef<NewTicketDialog, SupportTicket>);
  private readonly api = inject(TicketApi);

  protected readonly form = new FormGroup({
    subject: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(150)],
    }),
    category: new FormControl(TicketCategory.Technical, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    priority: new FormControl(TreatmentPriority.Medium, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(5000)],
    }),
  });

  protected readonly save = async (): Promise<void> => {
    this.ref.close(await firstValueFrom(this.api.open(this.form.getRawValue())));
  };
}

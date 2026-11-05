import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { TreatmentPriority } from '@enums/clinic/treatment-priority.enum';
import { TicketCategory } from '@enums/communication/ticket.enum';
import { SupportTicket } from '@interfaces/communication/support-ticket.interface';
import { TicketApi } from '@services/communication/ticket-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { NEW_TICKET_DIALOG_TEXT } from '@constants/communication/new-ticket-dialog.constants';

const MAX_FILES = 10;
const MAX_FILE_MB = 10;

/** Open a support ticket: what is wrong, what kind of problem and how urgent. Closes with the new ticket. */
@Component({
  selector: 'app-new-ticket-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, GenericForm, TextField, SelectField],
  templateUrl: './new-ticket-dialog.component.html',
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

  /** Screenshots / photos / PDFs, uploaded once the ticket exists. */
  protected readonly files = signal<File[]>([]);
  private readonly notify = inject(NotifyService);

  protected pick(input: HTMLInputElement): void {
    const picked = [...(input.files ?? [])].filter((f) => f.size <= MAX_FILE_MB * 1048576);
    if (picked.length < (input.files?.length ?? 0))
      this.notify.warning(NEW_TICKET_DIALOG_TEXT.filesOverMbWereLeft(MAX_FILE_MB));
    this.files.update((list) => [...list, ...picked].slice(0, MAX_FILES));
    input.value = '';
  }

  protected remove(file: File): void {
    this.files.update((list) => list.filter((f) => f !== file));
  }

  protected readonly save = async (): Promise<void> => {
    const ticket = await firstValueFrom(this.api.open(this.form.getRawValue()));
    if (this.files().length) {
      try {
        await firstValueFrom(this.api.attach(ticket.id, this.files()));
      } catch (e) {
        // The ticket is open either way; the files can be added on its page.
        this.notify.error(e);
      }
    }
    this.ref.close(ticket);
  };
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { TreatmentPriority } from '@shared/enums/clinic/treatment-priority.enum';
import { TicketCategory } from '@shared/enums/communication/ticket.enum';
import { SupportTicket } from '@shared/interfaces/communication/ticket.interface';
import { TicketApi } from '@shared/services/communication/ticket-api.service';
import { NotifyService } from '@shared/services/ui/notify.service';

const MAX_FILES = 10;
const MAX_FILE_MB = 10;

/** Open a support ticket: what is wrong, what kind of problem and how urgent. Closes with the new ticket. */
@Component({
  selector: 'app-new-ticket-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, GenericForm, TextField, SelectField],
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
        <div class="mb-2">
          <input
            #picker
            type="file"
            hidden
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            (change)="pick(picker)"
          />
          <button matButton type="button" (click)="picker.click()">
            <mat-icon>add_photo_alternate</mat-icon> Add screenshots or photos
          </button>
          <span class="ml-2 text-xs text-on-surface-variant"
            >JPEG, PNG, WebP or PDF, up to 10 MB each</span
          >
          @if (files().length) {
            <div class="mt-2 flex flex-wrap gap-2">
              @for (f of files(); track f) {
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-xs text-on-secondary-container"
                >
                  <mat-icon class="!size-4 !text-base">{{
                    f.type.startsWith('image/') ? 'image' : 'picture_as_pdf'
                  }}</mat-icon>
                  {{ f.name }}
                  <button
                    type="button"
                    class="ml-1 cursor-pointer border-0 bg-transparent p-0 text-inherit"
                    [attr.aria-label]="'Remove ' + f.name"
                    (click)="remove(f)"
                  >
                    <mat-icon class="!size-4 !text-base">close</mat-icon>
                  </button>
                </span>
              }
            </div>
          }
        </div>
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

  /** Screenshots / photos / PDFs, uploaded once the ticket exists. */
  protected readonly files = signal<File[]>([]);
  private readonly notify = inject(NotifyService);

  protected pick(input: HTMLInputElement): void {
    const picked = [...(input.files ?? [])].filter((f) => f.size <= MAX_FILE_MB * 1048576);
    if (picked.length < (input.files?.length ?? 0))
      this.notify.warning(`Files over ${MAX_FILE_MB} MB were left out.`);
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

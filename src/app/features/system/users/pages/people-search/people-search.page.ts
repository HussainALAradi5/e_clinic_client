import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { PersonFormDialog } from '../../components/person-form-dialog/person-form-dialog.component';
import { PersonFormDialogData } from '../../interfaces/dialog-data.interface';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { DuplicateCheckPayload, Person } from '@shared/interfaces/identity/person.interface';
import { AgePipe } from '@shared/pipes/age.pipe';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { AccessService } from '@shared/services/auth/access.service';
import { UserApi } from '@shared/services/identity/user-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';

/**
 * `/system/people` — find any person (patient or staff) before registering anyone, so the existing record is reused.
 * The duplicate check matches the exact national ID (blind index) or the same mobile + date of birth.
 */
@Component({
  selector: 'app-people-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResourceListPage,
    CellDef,
    GenericForm,
    TextField,
    MatCardModule,
    MatIconModule,
    DatePipe,
    AgePipe,
    StatusChip,
  ],
  templateUrl: './people-search.page.html',
})
export class PeopleSearchPage {
  private readonly api = inject(UserApi);
  private readonly access = inject(AccessService);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly list = viewChild.required(ResourceListPage);

  protected readonly dateFormat = DATE_FORMAT;
  protected readonly columns = [
    'code',
    'full_name',
    'gender',
    'date_of_birth',
    'phone',
    'email',
    'account',
  ];
  protected readonly candidates = signal<Person[] | null>(null);
  protected readonly duplicateForm = new FormGroup({
    nationalId: new FormControl<string | null>(null),
    phone: new FormControl<string | null>(null),
    dateOfBirth: new FormControl<string | null>(null),
  });

  protected readonly checkDuplicates = async (value: DuplicateCheckPayload): Promise<void> => {
    this.candidates.set(await firstValueFrom(this.api.duplicates(value)));
  };

  protected async edit(row: { id: string }): Promise<void> {
    if (!this.access.can('people.write')) {
      return;
    }
    const saved = await this.dialogs.open<PersonFormDialog, PersonFormDialogData, boolean>(
      PersonFormDialog,
      {
        person: row as Person,
        save: (payload) => firstValueFrom(this.api.updatePerson(row.id, payload)),
      },
      { width: '720px' },
    );
    if (saved) {
      this.notify.success('Personal data saved.');
      this.list().reload();
    }
  }
}

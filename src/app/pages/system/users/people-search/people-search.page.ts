import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { PersonFormDialog } from '@components/system/users/person-form-dialog/person-form-dialog.component';
import { PersonFormDialogData } from '@interfaces/system/users/person-form-dialog-data.interface';
import { CellDef } from '@components/common/data-table/cell.directive';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { DuplicateCheckPayload } from '@interfaces/identity/duplicate-check-payload.interface';
import { Person } from '@interfaces/identity/person.interface';
import { AgePipe } from '@pipes/age.pipe';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { AccessService } from '@services/auth/access.service';
import { UserApi } from '@services/identity/user-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { PEOPLE_SEARCH_TEXT } from '@constants/system/people-search.constants';

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
      this.notify.success(PEOPLE_SEARCH_TEXT.personalDataSaved);
      this.list().reload();
    }
  }
}

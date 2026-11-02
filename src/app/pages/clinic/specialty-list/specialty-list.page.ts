import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SpecialtyFormDialog } from '@components/clinic/specialty-form-dialog/specialty-form-dialog.component';
import { SpecialtyFormDialogData } from '@interfaces/clinic/specialty-form-dialog-data.interface';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { Specialty } from '@interfaces/clinic/specialty.interface';
import { AccessService } from '@services/auth/access.service';
import { SpecialtyApi } from '@services/clinic/doctor-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { SPECIALTY_LIST_TEXT } from '@constants/clinic/specialty-list.constants';

/** `/clinic/specialties` — specialties with bulk archive / delete / restore; click a row to edit. */
@Component({
  selector: 'app-specialty-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton],
  templateUrl: './specialty-list.page.html',
})
export class SpecialtyListPage {
  private readonly api = inject(SpecialtyApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly canEdit = inject(AccessService).can('specialties.write');
  private readonly list = viewChild.required(ResourceListPage);

  protected readonly create = async (): Promise<void> => {
    const saved = await this.open(null, (payload) => firstValueFrom(this.api.create(payload)));
    if (saved) this.notify.success(SPECIALTY_LIST_TEXT.specialtyCreated(saved.name));
  };

  protected async edit(row: { id: string }): Promise<void> {
    if (!this.canEdit) return;
    const specialty = await firstValueFrom(this.api.get(row.id));
    const saved = await this.open(specialty, (payload) =>
      firstValueFrom(this.api.update(specialty.id, payload)),
    );
    if (saved) this.notify.success(SPECIALTY_LIST_TEXT.specialtySaved);
  }

  private async open(
    specialty: Specialty | null,
    save: SpecialtyFormDialogData['save'],
  ): Promise<Specialty | undefined> {
    const saved = await this.dialogs.open<SpecialtyFormDialog, SpecialtyFormDialogData, Specialty>(
      SpecialtyFormDialog,
      { specialty, save },
      { width: '520px' },
    );
    if (saved) this.list().reload();
    return saved;
  }
}

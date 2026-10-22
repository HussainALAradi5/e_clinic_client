import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CountryFormDialog } from '../../components/country-form-dialog/country-form-dialog.component';
import { CountryFormDialogData } from '../../interfaces/dialog-data.interface';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { Country } from '@shared/interfaces/reference/country.interface';
import { AccessService } from '@shared/services/auth/access.service';
import { CountryApi } from '@shared/services/reference/country-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { Flag } from '@shared/components/flag/flag.component';

/** `/reference/countries` — ISO country list; reference editors relabel, reorder and hide countries. */
@Component({
  selector: 'app-country-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Flag, ResourceListPage, CellDef],
  templateUrl: './country-list.page.html',
})
export class CountryListPage {
  private readonly api = inject(CountryApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly access = inject(AccessService);
  private readonly list = viewChild.required(ResourceListPage);

  protected async edit(row: { id: string }): Promise<void> {
    if (!this.access.can('reference.write')) {
      return;
    }
    const country = row as unknown as Country;
    const saved = await this.dialogs.open<CountryFormDialog, CountryFormDialogData, Country>(
      CountryFormDialog,
      {
        country,
        save: (payload) => firstValueFrom(this.api.update(country.code, payload)),
      },
    );
    if (saved) {
      this.notify.success(`${saved.name} saved.`);
      this.list().reload();
    }
  }
}

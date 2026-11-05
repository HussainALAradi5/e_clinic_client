import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CountryFormDialog } from '@components/reference/country-form-dialog/country-form-dialog.component';
import { CountryFormDialogData } from '@interfaces/reference/country-form-dialog-data.interface';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { Country } from '@interfaces/reference/country.interface';
import { AccessService } from '@services/auth/access.service';
import { CountryApi } from '@services/reference/country-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { Flag } from '@components/common/flag/flag.component';
import { COUNTRY_LIST_TEXT } from '@constants/reference/country-list.constants';

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

  protected readonly text = COUNTRY_LIST_TEXT;
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

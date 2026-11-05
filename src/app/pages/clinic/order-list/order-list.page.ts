import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CellDef } from '@components/common/data-table/cell.directive';
import { EnumFilter } from '@components/common/enum-filter/enum-filter.component';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { ORDER_LIST_TEXT } from '@constants/clinic/order-list.constants';

/**
 * `/clinic/clinical-orders` — every imaging / lab / ECG order and referral, searchable and filterable; a quick
 * filter by kind (each kind keeps its colour on the badge).
 */
@Component({
  selector: 'app-order-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResourceListPage,
    CellDef,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    EnumFilter,
  ],
  templateUrl: './order-list.page.html',
})
export class OrderListPage {
  protected readonly text = ORDER_LIST_TEXT;

  protected readonly dateFormat = DATE_FORMAT;

  protected readonly type = signal<string | null>(null);
  protected readonly params = computed((): Record<string, string> => {
    const type = this.type();
    return type ? { 'filter[type][eq]': type } : {};
  });
}

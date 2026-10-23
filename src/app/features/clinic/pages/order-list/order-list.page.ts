import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';

/** `/clinic/clinical-orders` — every imaging / lab / ECG order and referral, searchable and filterable. */
@Component({
  selector: 'app-order-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, DatePipe, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './order-list.page.html',
})
export class OrderListPage {
  protected readonly dateFormat = DATE_FORMAT;
}

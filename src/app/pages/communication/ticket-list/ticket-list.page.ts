import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { debounceTime, EMPTY, merge, switchMap } from 'rxjs';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { DATE_TIME_FORMAT } from '@constants/app.constants';
import { SupportTicket } from '@interfaces/communication/support-ticket.interface';
import { AccessService } from '@services/auth/access.service';
import { AuthStore } from '@services/auth/auth.store';
import { RealtimeService } from '@services/communication/realtime.service';
import { DialogService } from '@services/ui/dialog.service';
import { NewTicketDialog } from '@components/communication/new-ticket-dialog/new-ticket-dialog.component';

/**
 * `/support/tickets` — the generic list (server filters by status, priority, category, people and dates; search;
 * sort; paging; saved views). Staff see their own tickets, admins the whole desk. Refreshes live on ticket changes.
 */
@Component({
  selector: 'app-ticket-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, DatePipe, MatIconModule],
  templateUrl: './ticket-list.page.html',
})
export class TicketListPage {
  private readonly dialogs = inject(DialogService);
  private readonly router = inject(Router);
  private readonly access = inject(AccessService);
  private readonly list = viewChild.required(ResourceListPage);

  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly desk = computed(() => this.access.can('tickets.resolve'));

  constructor() {
    const realtime = inject(RealtimeService);
    const auth = inject(AuthStore);
    // Admins follow the whole desk, everyone else their own tickets.
    toObservable(computed(() => ({ id: auth.user()?.id, desk: this.desk() })))
      .pipe(
        switchMap(({ id, desk }) =>
          id
            ? merge(
                realtime.listen(`user.${id}`, 'ticket.changed'),
                desk ? realtime.listen('support', 'ticket.changed') : EMPTY,
              )
            : EMPTY,
        ),
        debounceTime(300),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.list().reload());
  }

  protected readonly openNew = async (): Promise<void> => {
    const ticket = await this.dialogs.open<NewTicketDialog, null, SupportTicket>(
      NewTicketDialog,
      null,
      {
        width: '560px',
      },
    );
    if (ticket) void this.router.navigate(['/support/tickets', ticket.id]);
  };
}

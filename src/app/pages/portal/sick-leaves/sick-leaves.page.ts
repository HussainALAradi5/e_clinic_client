import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { SickLeave } from '@interfaces/clinic/sick-leave.interface';
import { SickLeaveApi } from '@services/clinic/sick-leave-api.service';
import { defaultQuery } from '@utilities/list-query';
import { SICK_LEAVES_TEXT } from '@constants/portal/sick-leaves.constants';

/** `/portal/sick-leaves` — every sick leave the clinic gave me, newest first, each ready to print or show. */
@Component({
  selector: 'app-my-sick-leaves-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatIconModule, EmptyState, ErrorState, PageHeader],
  templateUrl: './sick-leaves.page.html',
})
export class MySickLeavesPage implements OnInit {
  private readonly api = inject(SickLeaveApi);

  protected readonly text = SICK_LEAVES_TEXT;
  protected readonly leaves = signal<SickLeave[] | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly dateFormat = DATE_FORMAT;

  async ngOnInit(): Promise<void> {
    try {
      const page = await firstValueFrom(
        this.api.list(defaultQuery({ perPage: 100, sort: ['-issued_at'] })),
      );
      this.leaves.set(page.data);
    } catch (e) {
      this.error.set(e);
    }
  }
}

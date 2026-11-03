import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { PortalActions } from '@services/portal/portal-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { CLINIC_TIME_ZONE, DATE_FORMAT } from '@constants/app.constants';
import { IMAGING_ORDER_TYPES } from '@enums/clinic/clinical-order-type.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { ButtonSize } from '@enums/ui/button-size.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Attachment } from '@interfaces/attachment/attachment.interface';
import { ClinicalOrder } from '@interfaces/clinic/clinical-order.interface';
import { ClinicalOrderApi } from '@services/clinic/clinical-order-api.service';
import { formatBytes } from '@utilities/text';
import { EnumFilter } from '@components/common/enum-filter/enum-filter.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';

/**
 * `/portal/results` — completed tests and scans, newest first. Opening one shows the report and its images or
 * files; results appear once the doctor has completed them.
 */
@Component({
  selector: 'app-my-results-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    AppButton,
    EmptyState,
    Skeleton,
    EnumFilter,
    StatusChip,
  ],
  templateUrl: './results.page.html',
})
export class MyResultsPage {
  private readonly api = inject(ClinicalOrderApi);
  private readonly actions = inject(PortalActions);

  protected readonly dateFormat = DATE_FORMAT;
  protected readonly zone = CLINIC_TIME_ZONE;
  protected readonly variants = ButtonVariant;
  protected readonly sizes = ButtonSize;
  protected readonly size = formatBytes;
  protected readonly imaging = IMAGING_ORDER_TYPES;

  protected readonly results = signal<ClinicalOrder[] | null>(null);
  protected readonly open = signal<string | null>(null);
  protected readonly details = signal<Record<string, ClinicalOrder>>({});

  /** Quick filter (on the server): one kind of result. */
  protected readonly type = signal<string | null>(null);

  constructor() {
    effect(() => {
      const type = this.type();
      untracked(() => {
        this.results.set(null);
        firstValueFrom(
          this.api.list({
            perPage: 50,
            sort: ['-completedAt'],
            filter: {
              and: [
                { status: { eq: GenericStatus.Completed } },
                ...(type ? [{ type: { eq: type } }] : []),
              ],
            },
          }),
        )
          .then((page) => this.results.set(page.data))
          .catch(() => this.results.set([]));
      });
    });
  }

  protected async toggle(order: ClinicalOrder): Promise<void> {
    this.open.update((id) => (id === order.id ? null : order.id));
    if (this.open() === order.id && !this.details()[order.id]) {
      const full = await firstValueFrom(this.api.get(order.id)).catch(() => order);
      this.details.update((all) => ({ ...all, [order.id]: full }));
    }
  }

  protected readonly view = (file: Attachment): Promise<void> => this.actions.openFile(file);
}

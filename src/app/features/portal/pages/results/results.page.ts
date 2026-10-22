import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { PortalActions } from '../../services/portal-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { EmptyState } from '@shared/components/empty-state/empty-state.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { CLINIC_TIME_ZONE, DATE_FORMAT } from '@shared/constants/app.constants';
import { IMAGING_ORDER_TYPES } from '@shared/enums/clinic/clinical-order-type.enum';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import { ButtonSize, ButtonVariant } from '@shared/enums/ui/button.enum';
import { Attachment } from '@shared/interfaces/attachment/attachment.interface';
import { ClinicalOrder } from '@shared/interfaces/clinic/clinical-order.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { ClinicalOrderApi } from '@shared/services/clinic/clinical-order-api.service';
import { formatBytes } from '@shared/utils/text';

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
    EnumLabelPipe,
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

  constructor() {
    firstValueFrom(
      this.api.list({
        perPage: 50,
        sort: ['-completedAt'],
        filter: { and: [{ status: { eq: GenericStatus.Completed } }] },
      }),
    )
      .then((page) => this.results.set(page.data))
      .catch(() => this.results.set([]));
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

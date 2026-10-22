import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProgressMeter } from '../../components/progress-meter/progress-meter.component';
import { ClinicalActions } from '../../services/clinical-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { Treatment } from '@shared/interfaces/clinic/treatment.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { TreatmentApi } from '@shared/services/clinic/treatment-api.service';

/** `/clinic/treatments/queue` — open plans with no next session booked, urgent first: reception's work list. */
@Component({
  selector: 'app-treatment-queue-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    StatusChip,
    ProgressMeter,
    EnumLabelPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './treatment-queue.page.html',
})
export class TreatmentQueuePage {
  private readonly api = inject(TreatmentApi);
  private readonly actions = inject(ClinicalActions);
  protected readonly queue = signal<Treatment[] | null>(null);
  protected readonly dateFormat = DATE_FORMAT;

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.queue.set(await firstValueFrom(this.api.queue()).catch(() => []));
  }

  protected readonly book = async (treatment: Treatment): Promise<void> => {
    if (await this.actions.bookSession(treatment)) await this.load();
  };
}

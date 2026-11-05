import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProgressMeter } from '@components/common/progress-meter/progress-meter.component';
import { ClinicalActions } from '@services/clinic/clinical-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { Treatment } from '@interfaces/clinic/treatment.interface';
import { TreatmentApi } from '@services/clinic/treatment-api.service';
import { TREATMENT_QUEUE_TEXT } from '@constants/clinic/treatment-queue.constants';

/** `/clinic/treatments/queue` — open plans with no next session booked, urgent first: reception's work list. */
@Component({
  selector: 'app-treatment-queue-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    StatusChip,
    ProgressMeter,
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

  protected readonly text = TREATMENT_QUEUE_TEXT;
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

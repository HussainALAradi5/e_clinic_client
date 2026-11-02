import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PrintSheet } from '@components/common/print-sheet/print-sheet.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { ClinicalOrder } from '@interfaces/clinic/clinical-order.interface';
import { RecordDiagnosis } from '@interfaces/clinic/record-diagnosis.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { ClinicalOrderApi } from '@services/clinic/clinical-order-api.service';
import { MedicalRecordApi } from '@services/clinic/medical-record-api.service';

/** `/print/referral/:id` — referral letter with reason, diagnoses of the visit, priority and a verification QR. */
@Component({
  selector: 'app-referral-letter-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrintSheet, ErrorState, EnumLabelPipe, DatePipe],
  templateUrl: './referral-letter.page.html',
})
export class ReferralLetterPage implements OnInit {
  readonly id = input.required<string>();

  private readonly orders = inject(ClinicalOrderApi);
  private readonly records = inject(MedicalRecordApi);
  protected readonly order = signal<ClinicalOrder | null>(null);
  protected readonly diagnoses = signal<RecordDiagnosis[]>([]);
  protected readonly error = signal<unknown>(null);
  protected readonly dateFormat = DATE_FORMAT;

  async ngOnInit(): Promise<void> {
    try {
      const order = await firstValueFrom(this.orders.get(this.id()));
      this.order.set(order);
      if (order.appointmentId) {
        const record = await firstValueFrom(this.records.get(order.appointmentId)).catch(
          () => null,
        );
        this.diagnoses.set(record?.diagnoses ?? []);
      }
    } catch (error) {
      this.error.set(error);
    }
  }
}

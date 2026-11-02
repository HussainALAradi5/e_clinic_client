import { DatePipe, LowerCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { PrintSheet } from '@components/common/print-sheet/print-sheet.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { Dispensation } from '@interfaces/pharmacy/dispensation.interface';
import { PrescriptionItem } from '@interfaces/pharmacy/prescription-item.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { QtyPipe } from '@pipes/qty.pipe';
import { DispensationApi } from '@services/pharmacy/dispensation-api.service';
import { PrescriptionApi } from '@services/pharmacy/prescription-api.service';

/**
 * `/print/medicine-label/:id` — the label stuck on what was handed over (80 mm): one block per medicine with the
 * prescribed dosage and instructions, the lot and its expiry.
 */
@Component({
  selector: 'app-medicine-label-print-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrintSheet, ErrorState, EnumLabelPipe, QtyPipe, DatePipe, LowerCasePipe],
  templateUrl: './medicine-label-print.page.html',
})
export class MedicineLabelPrintPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(DispensationApi);
  private readonly prescriptions = inject(PrescriptionApi);
  protected readonly dispensation = signal<Dispensation | null>(null);
  private readonly lines = signal<PrescriptionItem[]>([]);
  protected readonly error = signal<unknown>(null);
  protected readonly dateFormat = DATE_FORMAT;
  /** Dosage of each prescription line, by its id. */
  protected readonly dosage = computed(() => new Map(this.lines().map((l) => [l.id, l])));

  async ngOnInit(): Promise<void> {
    try {
      const dispensation = await firstValueFrom(this.api.get(this.id()));
      if (dispensation.prescriptionId) {
        const rx = await firstValueFrom(this.prescriptions.get(dispensation.prescriptionId)).catch(
          () => null,
        );
        this.lines.set(rx?.items ?? []);
      }
      this.dispensation.set(dispensation);
    } catch (error) {
      this.error.set(error);
    }
  }
}

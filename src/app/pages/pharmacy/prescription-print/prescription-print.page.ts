import { DocumentType } from '@enums/documents/document-type.enum';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { PrintSheet } from '@components/common/print-sheet/print-sheet.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { Prescription } from '@interfaces/pharmacy/prescription.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { QtyPipe } from '@pipes/qty.pipe';
import { PrescriptionApi } from '@services/pharmacy/prescription-api.service';

/** `/print/prescription/:id` — the prescription on A4 with its QR for the pharmacy (and any pharmacy to verify). */
@Component({
  selector: 'app-prescription-print-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrintSheet, ErrorState, EnumLabelPipe, QtyPipe, DatePipe, LowerCasePipe],
  templateUrl: './prescription-print.page.html',
})
export class PrescriptionPrintPage implements OnInit {
  protected readonly documentType = DocumentType;
  readonly id = input.required<string>();

  private readonly api = inject(PrescriptionApi);
  protected readonly prescription = signal<Prescription | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly cancelled = GenericStatus.Cancelled;

  async ngOnInit(): Promise<void> {
    try {
      this.prescription.set(await firstValueFrom(this.api.get(this.id())));
    } catch (error) {
      this.error.set(error);
    }
  }
}

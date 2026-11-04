import { DocumentType } from '@enums/documents/document-type.enum';
import { DatePipe } from '@angular/common';
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
import { ClinicalOrder } from '@interfaces/clinic/clinical-order.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { AttachmentApi } from '@services/attachment/attachment-api.service';
import { EnumService } from '@services/data/enum.service';
import { ClinicalOrderApi } from '@services/clinic/clinical-order-api.service';
import { RESULT_PRINT_TEXT } from '@constants/clinic/result-print.constants';

/**
 * `/print/result/:id` — the report of an X-ray, ultrasound or lab test: patient, who ordered, performed and reported
 * it, the findings (abnormal flagged), and its images printed on the page. A QR lets another hospital check it.
 */
@Component({
  selector: 'app-result-print-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, EnumLabelPipe, ErrorState, PrintSheet],
  templateUrl: './result-print.page.html',
})
export class ResultPrintPage implements OnInit {
  protected readonly documentType = DocumentType;
  readonly id = input.required<string>();
  private readonly orders = inject(ClinicalOrderApi);
  private readonly files = inject(AttachmentApi);
  protected readonly order = signal<ClinicalOrder | null>(null);
  protected readonly images = signal<{ name: string; url: string }[]>([]);
  protected readonly error = signal<unknown>(null);
  private readonly enums = inject(EnumService);
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly title = computed(() => {
    switch (this.order()?.type) {
      case 'xray':
        return RESULT_PRINT_TEXT.xRayReport;
      case 'ultrasound':
        return RESULT_PRINT_TEXT.ultrasoundReport;
      case 'lab_test':
        return RESULT_PRINT_TEXT.laboratoryResult;
      default:
        return RESULT_PRINT_TEXT.resultReport;
    }
  });

  async ngOnInit(): Promise<void> {
    // Printed outside the app shell: load the enum labels ("X-ray", "Female") first.
    this.enums.load().subscribe({ error: () => undefined });
    try {
      const order = await firstValueFrom(this.orders.get(this.id()));
      this.order.set(order);
      const pictures = (order.attachments ?? []).filter((f) => f.mimeType.startsWith('image/'));
      const links = await Promise.all(
        pictures.map((f) =>
          firstValueFrom(this.files.link(f.id))
            .then((l) => ({ name: f.originalName, url: l.url }))
            .catch(() => null),
        ),
      );
      this.images.set(links.filter((l): l is { name: string; url: string } => l !== null));
    } catch (e) {
      this.error.set(e);
    }
  }
}

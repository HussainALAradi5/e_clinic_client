import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrandMark } from '@components/common/brand-mark/brand-mark.component';
import { CodeImage } from '@components/common/code-image/code-image.component';
import { DocumentActions } from '@components/documents/document-actions/document-actions.component';
import { DocumentType } from '@enums/documents/document-type.enum';
import { CLINIC_TIME_ZONE } from '@constants/app.constants';
import { PRINT_SHEET_TEXT } from '@constants/common/print-sheet.constants';

/**
 * Printable document: clinic header, title, content, and a signed QR the receiver can scan to check the document
 * is genuine. `paper="receipt"` lays it out for an 80 mm receipt printer. The Print button is hidden on paper.
 */
@Component({
  selector: 'app-print-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BrandMark,
    CodeImage,
    DocumentActions,
    MatButtonModule,
    MatIconModule,
    NgTemplateOutlet,
  ],
  host: { class: 'block min-h-dvh bg-surface-container-low py-6 print:bg-white print:py-0' },
  templateUrl: './print-sheet.component.html',
})
export class PrintSheet {
  readonly title = input.required<string>();
  /** Code entity alias and id of the QR (e.g. `clinical_order`); null prints no QR (e.g. a payslip). */
  readonly entity = input<string | null>(null);
  readonly recordId = input.required<string>();
  readonly reference = input.required<string>();
  readonly paper = input<'a4' | 'receipt'>('a4');
  /** Line next to the QR code. */
  readonly verifyNote = input(PRINT_SHEET_TEXT.scanTheCodeToCheck);
  /** The server's branded PDF of this record (Open PDF / Download beside Print); null shows none. */
  readonly document = input<DocumentType | null>(null);
  /** Record of that PDF when it differs from `recordId` (e.g. a claim printed with its invoice's QR). */
  readonly documentId = input<string | null>(null);

  protected readonly today = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long',
    timeZone: CLINIC_TIME_ZONE,
  }).format(new Date());

  protected print(): void {
    window.print();
  }
}

import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrandMark } from '@components/common/brand-mark/brand-mark.component';
import { CodeImage } from '@components/common/code-image/code-image.component';
import { CLINIC_TIME_ZONE } from '@constants/app.constants';

/**
 * Printable document: clinic header, title, content, and a signed QR the receiver can scan to check the document
 * is genuine. `paper="receipt"` lays it out for an 80 mm receipt printer. The Print button is hidden on paper.
 */
@Component({
  selector: 'app-print-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BrandMark, CodeImage, MatButtonModule, MatIconModule, NgTemplateOutlet],
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
  readonly verifyNote = input(
    'Scan the code to check this document is genuine and still valid. It carries no medical details.',
  );

  protected readonly today = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long',
    timeZone: CLINIC_TIME_ZONE,
  }).format(new Date());

  protected print(): void {
    window.print();
  }
}

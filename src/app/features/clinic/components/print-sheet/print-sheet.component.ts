import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { BrandMark } from '@shared/components/brand-mark/brand-mark.component';
import { CLINIC_TIME_ZONE } from '@shared/constants/app.constants';
import { CodeApi } from '@shared/services/code/code-api.service';

/**
 * A4 printable document: clinic header, title, content, and a signed QR the receiver can scan to check the
 * document is genuine. The Print button is hidden on paper.
 */
@Component({
  selector: 'app-print-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BrandMark, MatButtonModule, MatIconModule],
  host: { class: 'block min-h-dvh bg-surface-container-low py-6 print:bg-white print:py-0' },
  templateUrl: './print-sheet.component.html',
})
export class PrintSheet implements OnInit {
  readonly title = input.required<string>();
  /** Code entity alias and id of the QR (e.g. `clinical_order`). */
  readonly entity = input.required<string>();
  readonly recordId = input.required<string>();
  readonly reference = input.required<string>();

  private readonly codes = inject(CodeApi);
  protected readonly qr = signal<string | null>(null);
  protected readonly today = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long',
    timeZone: CLINIC_TIME_ZONE,
  }).format(new Date());

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      const url = this.qr();
      if (url) URL.revokeObjectURL(url);
    });
  }

  async ngOnInit(): Promise<void> {
    const image = await firstValueFrom(
      this.codes.image(this.entity(), this.recordId(), { size: 220 }),
    ).catch(() => null);
    this.qr.set(image?.url ?? null);
  }

  protected print(): void {
    window.print();
  }
}

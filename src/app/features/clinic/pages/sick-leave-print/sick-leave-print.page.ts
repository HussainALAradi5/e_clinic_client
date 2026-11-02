import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { PrintSheet } from '@shared/components/print-sheet/print-sheet.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { SickLeave } from '@shared/interfaces/clinic/sick-leave.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { EnumService } from '@shared/services/data/enum.service';
import { SickLeaveApi } from '@shared/services/clinic/sick-leave-api.service';

/**
 * `/print/sick-leave/:id` — the certificate: patient, days off, the reason only when it may be printed, the doctor's
 * name and signature line, and a QR an employer scans to check it (dates only).
 */
@Component({
  selector: 'app-sick-leave-print-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, EnumLabelPipe, ErrorState, PrintSheet],
  templateUrl: './sick-leave-print.page.html',
})
export class SickLeavePrintPage implements OnInit {
  readonly id = input.required<string>();
  private readonly api = inject(SickLeaveApi);
  protected readonly leave = signal<SickLeave | null>(null);
  protected readonly error = signal<unknown>(null);
  private readonly enums = inject(EnumService);
  protected readonly dateFormat = DATE_FORMAT;

  async ngOnInit(): Promise<void> {
    // Printed outside the app shell: load the enum labels ("X-ray", "Female") first.
    this.enums.load().subscribe({ error: () => undefined });
    try {
      this.leave.set(await firstValueFrom(this.api.get(this.id())));
    } catch (e) {
      this.error.set(e);
    }
  }
}

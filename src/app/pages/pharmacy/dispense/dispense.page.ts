import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OtcSale } from '@components/pharmacy/otc-sale/otc-sale.component';
import { RxDispensePanel } from '@components/pharmacy/rx-dispense-panel/rx-dispense-panel.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { ScanPurpose } from '@enums/code/scan-purpose.enum';
import { Dispensation } from '@interfaces/pharmacy/dispensation.interface';
import { Prescription } from '@interfaces/pharmacy/prescription.interface';
import { CodeApi } from '@services/code/code-api.service';
import { PrescriptionApi } from '@services/pharmacy/prescription-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { defaultQuery } from '@utilities/list-query';

/** Signed QR payload of a record: `<alias>:<code>.<signature>`. */
const QR_PAYLOAD = /^[a-z_]+:[A-Z0-9-]+\.[a-f0-9]+$/;

/**
 * `/pharmacy/dispense` — the pharmacy counter. Prescriptions: the queue (oldest first), scan or search a prescription,
 * check the packs and hand over (partly if needed). Over the counter: medicines that need no prescription.
 * After each hand-over the label can be printed.
 */
@Component({
  selector: 'app-dispense-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    StatusChip,
    TextField,
    RxDispensePanel,
    OtcSale,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    DatePipe,
  ],
  templateUrl: './dispense.page.html',
})
export class DispensePage implements OnInit {
  /** `?rx=<id>` opens that prescription (the Dispense button of a prescription page). */
  readonly rx = input<string | undefined>();

  private readonly prescriptions = inject(PrescriptionApi);
  private readonly codes = inject(CodeApi);
  private readonly notify = inject(NotifyService);

  protected readonly mode = signal<'prescriptions' | 'counter'>('prescriptions');
  protected readonly queue = signal<Prescription[] | null>(null);
  protected readonly selected = signal<string | null>(null);
  protected readonly last = signal<Dispensation | null>(null);
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly dateFormat = DATE_FORMAT;

  ngOnInit(): void {
    this.selected.set(this.rx() ?? null);
    void this.loadQueue();
  }

  protected async loadQueue(): Promise<void> {
    const text = this.search.value.trim();
    const page = await firstValueFrom(
      this.prescriptions.queue(defaultQuery({ perPage: 30, search: text || undefined })),
    ).catch(() => null);
    this.queue.set(page?.data ?? []);
  }

  /** Enter in the search box: a scanned prescription QR opens it; anything else filters the queue. */
  protected async find(): Promise<void> {
    const text = this.search.value.trim();
    if (QR_PAYLOAD.test(text)) {
      this.search.setValue('');
      const result = await firstValueFrom(this.codes.scan(text, ScanPurpose.Identify)).catch(
        () => null,
      );
      if (result?.entity === 'prescription' && result.valid) {
        this.mode.set('prescriptions');
        this.selected.set(result.id);
      } else {
        this.notify.error('This code is not a valid prescription.');
      }
      await this.loadQueue();
      return;
    }
    await this.loadQueue();
  }

  protected select(rx: Prescription): void {
    this.selected.set(rx.id);
    this.last.set(null);
  }

  protected async done(dispensation: Dispensation): Promise<void> {
    this.last.set(dispensation);
    this.notify.success(`${dispensation.code} handed over and charged to the patient.`);
    await this.loadQueue();
  }
}

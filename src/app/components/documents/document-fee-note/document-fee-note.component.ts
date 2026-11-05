import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of } from 'rxjs';
import { FEE_TEXT } from '@constants/billing/appointment-fee.constants';
import { WrittenDocumentKind } from '@enums/documents/written-document-kind.enum';
import { AppointmentFeeApi } from '@services/billing/appointment-fee-api.service';
import { formatMoney } from '@utilities/money';

/**
 * Tells the writer, before issuing, whether the chosen kind of document costs the patient money (from the price
 * list) or is free. The server charges it; this only informs.
 */
@Component({
  selector: 'app-document-fee-note',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: { class: 'block' },
  templateUrl: './document-fee-note.component.html',
})
export class DocumentFeeNote {
  readonly kind = input<WrittenDocumentKind | null>(null);

  private readonly fees = toSignal(
    inject(AppointmentFeeApi)
      .documentFees()
      .pipe(catchError(() => of([]))),
    { initialValue: [] },
  );
  protected readonly note = computed(() => {
    const fee = this.fees().find((f) => f.kind === this.kind());
    return fee
      ? { charged: true, text: FEE_TEXT.documentCharged(fee.name, formatMoney(fee.amount)) }
      : { charged: false, text: FEE_TEXT.documentFree };
  });
}

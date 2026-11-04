import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { CoverageNote } from '@components/billing/coverage-note/coverage-note.component';
import { Invoice } from '@interfaces/billing/invoice.interface';
import { InvoiceApi } from '@services/billing/invoice-api.service';

/**
 * The insurer / patient split of an invoice, read-only (invoice page). Reloads whenever the invoice changes
 * (a payment, a claim decision); shows nothing for uninsured patients.
 */
@Component({
  selector: 'app-invoice-coverage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CoverageNote],
  host: { class: 'block' },
  template: `@if (coverage(); as c) {
    <app-coverage-note [coverage]="c" [choosable]="false" />
  }`,
})
export class InvoiceCoverage {
  readonly invoice = input.required<Invoice>();

  private readonly api = inject(InvoiceApi);
  protected readonly coverage = toSignal(
    toObservable(this.invoice).pipe(
      switchMap((invoice) => this.api.coverage(invoice.id).pipe(catchError(() => of(null)))),
    ),
    { initialValue: null },
  );
}

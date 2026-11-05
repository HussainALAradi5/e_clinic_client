import { DocumentActions } from '@components/documents/document-actions/document-actions.component';
import { AccessService } from '@services/auth/access.service';
import { AuthStore } from '@services/auth/auth.store';
import { DatePipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '@interfaces/api/api-error.interface';
import { ScanResult } from '@interfaces/code/scan-result.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { CodeApi } from '@services/code/code-api.service';
import { humanise } from '@utilities/text';
import { VERIFY_TEXT } from '@constants/public/verify.constants';

/**
 * `/verify?code=…` — public authenticity check of a printed document (the QR on invoices, payslips,
 * certificates). Shows only non-sensitive facts: what it is, its number and date.
 */
@Component({
  selector: 'app-verify-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    DatePipe,
    KeyValuePipe,
    EnumLabelPipe,
    DocumentActions,
    RouterLink,
  ],
  templateUrl: './verify.page.html',
})
export class VerifyPage implements OnInit {
  /** Query parameter (the URL encoded in printed QR codes). */
  readonly code = input<string | undefined>();

  private readonly codes = inject(CodeApi);
  private readonly router = inject(Router);

  protected readonly payload = new FormControl('', { nonNullable: true });
  protected readonly result = signal<ScanResult | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly label = humanise;
  protected readonly signedIn = inject(AuthStore).isAuthenticated;
  protected readonly text = VERIFY_TEXT;
  /** Signed-in staff who scan codes (the front desk) get a way to the scan station. */
  protected readonly canScan = inject(AccessService).can(
    '(codes.read_all | codes.read_own) & codes.scan',
  );

  ngOnInit(): void {
    const code = this.code();
    if (code) {
      this.payload.setValue(code);
      this.check();
    }
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const code = this.payload.value.trim();
    void this.router.navigate([], { queryParams: { code: code || null }, replaceUrl: true });
    this.check();
  }

  protected isDate(key: string): boolean {
    return key.endsWith(VERIFY_TEXT.at) || key.endsWith(VERIFY_TEXT.date) || key === 'date';
  }

  private check(): void {
    const code = this.payload.value.trim();
    if (!code) {
      return;
    }
    this.busy.set(true);
    this.result.set(null);
    this.error.set(null);
    this.codes.verify(code).subscribe({
      next: (result) => {
        this.result.set(result);
        this.busy.set(false);
      },
      error: (e: ApiError) => {
        this.error.set(
          e.status === 404 ? VERIFY_TEXT.noDocumentWithThisCode : VERIFY_TEXT.thisCodeWasNotIssued,
        );
        this.busy.set(false);
      },
    });
  }
}

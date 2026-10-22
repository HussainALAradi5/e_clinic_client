import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Injector,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { OtpInput } from '@shared/components/otp-input/otp-input.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { LOGIN_PATH } from '@shared/constants/app.constants';
import { TOTP_LENGTH, TRUSTED_DEVICE_DAYS } from '@shared/constants/limits.constants';
import { SessionService } from '@shared/services/auth/session.service';

/**
 * `/login/2fa` — 6-digit TOTP code (auto-submits) or a one-time recovery code. "Don't ask again on this device"
 * (on by default) makes later sign-ins from this browser skip this step for TRUSTED_DEVICE_DAYS.
 */
@Component({
  selector: 'app-two-factor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GenericForm,
    TextField,
    OtpInput,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './two-factor.page.html',
})
export class TwoFactorPage implements OnInit {
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly formRef = viewChild.required(GenericForm);

  protected readonly useRecoveryCode = signal(false);
  protected readonly rememberDevice = signal(true);
  protected readonly trustedDays = TRUSTED_DEVICE_DAYS;
  protected readonly form = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(new RegExp(`^\\d{${TOTP_LENGTH}}$`))],
    }),
  });

  protected readonly submit = (value: { code: string }): Promise<void> =>
    this.session.verifyTwoFactor(value.code, this.useRecoveryCode(), this.rememberDevice());

  ngOnInit(): void {
    if (!this.session.challenge()) {
      void this.router.navigateByUrl(LOGIN_PATH);
      return;
    }
    this.form.controls.code.valueChanges
      .pipe(
        filter(
          (code) =>
            !this.useRecoveryCode() && code.length === TOTP_LENGTH && this.form.controls.code.valid,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      // After the next render the submit button reflects the now-dirty, valid form.
      .subscribe(() =>
        afterNextRender(() => this.formRef().requestSubmit(), { injector: this.injector }),
      );
  }

  protected toggleMode(): void {
    const recovery = !this.useRecoveryCode();
    this.useRecoveryCode.set(recovery);
    const code = this.form.controls.code;
    code.setValidators(
      recovery
        ? [Validators.required, Validators.maxLength(32)]
        : [Validators.required, Validators.pattern(new RegExp(`^\\d{${TOTP_LENGTH}}$`))],
    );
    code.reset('');
  }
}

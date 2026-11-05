import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { OtpInput } from '@components/common/otp-input/otp-input.component';
import { PasswordStrength } from '@components/common/password-strength/password-strength.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { LOGIN_PATH } from '@constants/app.constants';
import { RESEND_CODE_SECONDS, TOTP_LENGTH } from '@constants/limits.constants';
import { ResetStep } from '@enums/auth/reset-step.enum';
import { AuthApi } from '@services/identity/auth-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { AppValidators } from '@validations/validators';
import { PASSWORD_RESET_TEXT } from '@constants/system/password-reset.constants';

/**
 * `/password/forgot` — email → 6-digit code sent by email → new password (neutral answers, no account enumeration).
 * `/password/reset/:token` and `/reset-password?token=…&email=…` (invitation link) — straight to the new password.
 */
@Component({
  selector: 'app-password-reset-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GenericForm,
    TextField,
    OtpInput,
    PasswordStrength,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './password-reset.page.html',
})
export class PasswordResetPage implements OnInit {
  protected readonly text = PASSWORD_RESET_TEXT;

  /** Invitation link: route parameter (`/password/reset/:token`) or query parameter. */
  readonly token = input<string | undefined>();
  readonly email = input<string | undefined>();

  private readonly api = inject(AuthApi);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly codeFormRef = viewChild('codeStep', { read: GenericForm });

  protected readonly steps = ResetStep;
  protected readonly step = signal(ResetStep.Email);
  /** Token from a verified code (the invitation link brings its own). */
  private readonly codeToken = signal<string | null>(null);
  protected readonly resendIn = signal(0);
  /** The email is already known (code flow or link) — the password step does not ask for it. */
  protected readonly emailKnown = computed(() => !!this.codeToken() || !!this.email());

  protected readonly requestForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(255)],
    }),
  });

  protected readonly codeForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(new RegExp(`^\\d{${TOTP_LENGTH}}$`))],
    }),
  });

  protected readonly resetForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(255)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, AppValidators.strongPassword],
    }),
    passwordConfirmation: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, AppValidators.matchField('password')],
    }),
  });
  protected readonly password = toSignal(this.resetForm.controls.password.valueChanges, {
    initialValue: '',
  });

  protected readonly request = async (value: { email: string }): Promise<void> => {
    await firstValueFrom(this.api.forgotPassword(value));
    this.goToCode();
  };

  protected readonly verify = async (value: { code: string }): Promise<void> => {
    const email = this.requestForm.controls.email.value;
    const { token } = await firstValueFrom(this.api.verifyResetCode({ email, code: value.code }));
    this.codeToken.set(token);
    this.resetForm.controls.email.setValue(email);
    this.step.set(ResetStep.Password);
  };

  protected readonly reset = async (value: {
    email: string;
    password: string;
    passwordConfirmation: string;
  }): Promise<void> => {
    const token = this.codeToken() ?? this.token() ?? '';
    await firstValueFrom(this.api.resetPassword({ ...value, token }));
    this.notify.success(PASSWORD_RESET_TEXT.passwordSavedSignInWith);
    await this.router.navigateByUrl(LOGIN_PATH);
  };

  protected readonly resend = async (): Promise<void> => {
    await firstValueFrom(this.api.forgotPassword({ email: this.requestForm.controls.email.value }));
    this.codeForm.reset();
    this.startCooldown();
    this.notify.info(PASSWORD_RESET_TEXT.aNewCodeIsOn);
  };

  ngOnInit(): void {
    const email = this.email();
    if (email) {
      this.resetForm.controls.email.setValue(email);
    }
    if (this.token()) {
      this.step.set(ResetStep.Password);
    }

    // Six digits typed or pasted → check the code right away (same locking submit button).
    this.codeForm.controls.code.valueChanges
      .pipe(
        filter((code) => code.length === TOTP_LENGTH && this.codeForm.valid),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() =>
        afterNextRender(() => this.codeFormRef()?.requestSubmit(), { injector: this.injector }),
      );
  }

  /** "I already have a code" (e.g. sent by an administrator). */
  protected haveCode(): void {
    this.requestForm.markAllAsTouched();
    if (this.requestForm.valid) {
      this.goToCode(false);
    }
  }

  protected changeEmail(): void {
    this.codeForm.reset();
    this.step.set(ResetStep.Email);
  }

  private goToCode(sent = true): void {
    this.codeForm.reset();
    this.step.set(ResetStep.Code);
    if (sent) {
      this.startCooldown();
    }
  }

  private startCooldown(): void {
    this.resendIn.set(RESEND_CODE_SECONDS);
    const timer = setInterval(() => {
      this.resendIn.update((s) => Math.max(0, s - 1));
      if (this.resendIn() === 0) {
        clearInterval(timer);
      }
    }, 1000);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }
}

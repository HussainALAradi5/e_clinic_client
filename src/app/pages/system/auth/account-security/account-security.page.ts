import { SignatureCard } from '@components/settings/signature-card/signature-card.component';
import { TimePickerCard } from '@components/settings/time-picker-card/time-picker-card.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { AppButton } from '@components/common/app-button/app-button.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { NotificationSettingsCard } from '@components/notification/notification-settings-card/notification-settings-card.component';
import { PasswordStrength } from '@components/common/password-strength/password-strength.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { TOTP_LENGTH } from '@constants/limits.constants';
import { ButtonVariant } from '@enums/ui/button.enum';
import { ChangePasswordPayload } from '@interfaces/auth/change-password-payload.interface';
import { TwoFactorSetup } from '@interfaces/auth/two-factor-setup.interface';
import { ConfirmConfig } from '@interfaces/ui/confirm-config.interface';
import { AuthStore } from '@services/auth/auth.store';
import { SessionService } from '@services/auth/session.service';
import { AuthApi } from '@services/identity/auth-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { downloadBlob } from '@utilities/download';
import { AppValidators } from '@validations/validators';
import { ACCOUNT_SECURITY_TEXT } from '@constants/system/account-security.constants';

/** `/account/security` — change password, set up / disable TOTP 2FA, sign out of all devices. */
@Component({
  selector: 'app-account-security-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    GenericForm,
    TextField,
    PasswordStrength,
    AppButton,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NotificationSettingsCard,
    SignatureCard,
    TimePickerCard,
  ],
  templateUrl: './account-security.page.html',
})
export class AccountSecurityPage implements OnInit {
  /** `?setup=2fa` (sent by the 2FA-required redirect) scrolls to the 2FA section. */
  readonly setup = input<string | undefined>();

  protected readonly auth = inject(AuthStore);
  private readonly api = inject(AuthApi);
  private readonly session = inject(SessionService);
  private readonly notify = inject(NotifyService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly variants = ButtonVariant;
  protected readonly twoFactor = computed(() => this.auth.user()?.twoFactor);
  protected readonly enrolment = signal<TwoFactorSetup | null>(null);
  protected readonly recoveryCodes = signal<string[] | null>(null);
  protected readonly qrCode = computed<SafeUrl | null>(() => {
    const setup = this.enrolment();
    // Server-generated SVG shown as an image (cannot run scripts).
    return setup
      ? this.sanitizer.bypassSecurityTrustUrl(`data:image/svg+xml;base64,${btoa(setup.qrCodeSvg)}`)
      : null;
  });
  protected readonly secret = computed(
    () => new URL(this.enrolment()?.otpauthUrl ?? 'otpauth://x').searchParams.get('secret') ?? '',
  );

  protected readonly passwordForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, AppValidators.strongPassword],
    }),
    passwordConfirmation: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, AppValidators.matchField('password')],
    }),
  });
  protected readonly newPassword = toSignal(this.passwordForm.controls.password.valueChanges, {
    initialValue: '',
  });
  protected readonly confirmForm = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(new RegExp(`^\\d{${TOTP_LENGTH}}$`))],
    }),
  });
  protected readonly disableForm = new FormGroup({
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly logoutAllConfirm: ConfirmConfig = {
    title: ACCOUNT_SECURITY_TEXT.signOutOfAllDevices,
    message: ACCOUNT_SECURITY_TEXT.everySessionIncludingThisOne,
    confirmLabel: ACCOUNT_SECURITY_TEXT.signOutEverywhere,
    danger: true,
  };

  ngOnInit(): void {
    if (this.setup() === '2fa') {
      setTimeout(() =>
        this.host.nativeElement
          .querySelector('#two-factor')
          ?.scrollIntoView({ behavior: 'smooth' }),
      );
    }
  }

  protected readonly changePassword = async (value: ChangePasswordPayload): Promise<void> => {
    await firstValueFrom(this.api.changePassword(value));
    this.passwordForm.reset();
    this.notify.success(ACCOUNT_SECURITY_TEXT.passwordChangedYourOtherDevices);
  };

  protected readonly startEnrolment = async (): Promise<void> => {
    this.recoveryCodes.set(null);
    this.enrolment.set(await firstValueFrom(this.api.enableTwoFactor()));
  };

  protected readonly confirmEnrolment = async (value: { code: string }): Promise<void> => {
    const result = await firstValueFrom(this.api.confirmTwoFactor(value.code));
    await firstValueFrom(this.session.refresh());
    this.enrolment.set(null);
    this.recoveryCodes.set(result.recoveryCodes);
    this.confirmForm.reset();
    this.notify.success(ACCOUNT_SECURITY_TEXT.twoFactorAuthenticationIsOn);
  };

  protected readonly disableTwoFactor = async (value: { password: string }): Promise<void> => {
    await firstValueFrom(this.api.disableTwoFactor(value.password));
    this.disableForm.reset();
    await firstValueFrom(this.session.refresh());
    this.notify.success(ACCOUNT_SECURITY_TEXT.twoFactorAuthenticationIsOff);
  };

  protected readonly logoutAll = (): Promise<number> => firstValueFrom(this.session.logoutAll());

  protected copyCodes(codes: string[]): void {
    void navigator.clipboard
      .writeText(codes.join('\n'))
      .then(() => this.notify.success(ACCOUNT_SECURITY_TEXT.copied));
  }

  protected downloadCodes(codes: string[]): void {
    downloadBlob(
      new Blob([codes.join('\n') + '\n'], { type: 'text/plain' }),
      'e-clinic-recovery-codes.txt',
    );
  }
}

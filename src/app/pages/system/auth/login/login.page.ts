import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { LoginPayload } from '@interfaces/auth/auth-payloads.interface';
import { SessionService } from '@services/auth/session.service';
import { LOGIN_TEXT } from '@constants/system/login.constants';

/** `/login` — email + password; hands over to `/login/2fa` when a TOTP code is needed. */
@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GenericForm, TextField, RouterLink],
  templateUrl: './login.page.html',
})
export class LoginPage {
  protected readonly text = LOGIN_TEXT;

  /** Query parameter set by authGuard / the 401 handler. */
  readonly returnUrl = input<string | undefined>();

  private readonly session = inject(SessionService);

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(255)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
  });

  protected readonly submit = (value: Omit<LoginPayload, 'deviceName'>): Promise<void> =>
    this.session.login(value, this.returnUrl());
}

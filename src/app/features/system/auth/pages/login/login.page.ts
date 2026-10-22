import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { LoginPayload } from '@shared/interfaces/auth/auth-payloads.interface';
import { SessionService } from '@shared/services/auth/session.service';

/** `/login` — email + password; hands over to `/login/2fa` when a TOTP code is needed. */
@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GenericForm, TextField, RouterLink],
  templateUrl: './login.page.html',
})
export class LoginPage {
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

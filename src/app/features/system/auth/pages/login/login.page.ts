import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  input,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '@env';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { HOME_PATH } from '@shared/constants/app.constants';
import { DemoAccount } from '@shared/interfaces/auth/demo-account.interface';
import { LoginPayload } from '@shared/interfaces/auth/auth-payloads.interface';
import { SessionService } from '@shared/services/auth/session.service';
import { DemoAccounts } from '../../components/demo-accounts/demo-accounts.component';

/** `/login` — email + password; hands over to `/login/2fa` when a TOTP code is needed. */
@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GenericForm, TextField, RouterLink, DemoAccounts],
  templateUrl: './login.page.html',
})
export class LoginPage {
  /** Query parameter set by authGuard / the 401 handler. */
  readonly returnUrl = input<string | undefined>();

  private readonly session = inject(SessionService);
  private readonly injector = inject(Injector);
  private readonly formRef = viewChild.required(GenericForm);
  protected readonly demoLogins = environment.demoLogins;

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
    this.session.login(value, this.returnUrl() ?? HOME_PATH);

  /** Development builds: fill the demo account and sign in straight away (one click). */
  protected useDemo(account: DemoAccount): void {
    this.form.setValue({ email: account.email, password: this.demoLogins?.password ?? '' });
    this.form.markAsDirty();
    afterNextRender(() => this.formRef().requestSubmit(), { injector: this.injector });
  }
}

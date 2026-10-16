import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { PasswordStrength } from '@shared/components/password-strength/password-strength.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { LOGIN_PATH } from '@shared/constants/app.constants';
import { AuthApi } from '@shared/services/identity/auth-api.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { AppValidators } from '@shared/utils/validators';

/**
 * `/password/forgot` — request a link (neutral confirmation, no account enumeration).
 * `/password/reset/:token` and `/reset-password?token=…&email=…` (emailed link) — set a new password; also completes invitations.
 */
@Component({
  selector: 'app-password-reset-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GenericForm, TextField, PasswordStrength, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './password-reset.page.html',
})
export class PasswordResetPage implements OnInit {
  /** Route parameter (`/password/reset/:token`) or query parameter (emailed link). */
  readonly token = input<string | undefined>();
  readonly email = input<string | undefined>();

  private readonly api = inject(AuthApi);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly resetting = computed(() => !!this.token());
  protected readonly sent = signal(false);

  protected readonly requestForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(255)],
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
    this.sent.set(true);
  };

  protected readonly reset = async (value: {
    email: string;
    password: string;
    passwordConfirmation: string;
  }): Promise<void> => {
    await firstValueFrom(this.api.resetPassword({ ...value, token: this.token() ?? '' }));
    this.notify.success('Password saved. Sign in with your new password.');
    await this.router.navigateByUrl(LOGIN_PATH);
  };

  ngOnInit(): void {
    const email = this.email();
    if (email) {
      this.resetForm.controls.email.setValue(email);
    }
  }
}

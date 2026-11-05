import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { ONLINE_PAYMENT_SETTINGS_TEXT } from '@constants/system/online-payment-settings.constants';
import { OnlinePaymentSettings } from '@interfaces/reference/online-payment-settings.interface';
import { ClinicProfileApi } from '@services/reference/clinic-profile-api.service';
import { NotifyService } from '@services/ui/notify.service';

/**
 * The Online payments card (admins): the on / off switch, the Tap API address, payment sources and secret key
 * (write-only: the server keeps it encrypted and shows a hint), and the two addresses to register with Tap.
 */
@Component({
  selector: 'app-online-payment-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GenericForm,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    TextField,
  ],
  templateUrl: './online-payment-settings.component.html',
})
export class OnlinePaymentSettingsCard implements OnInit {
  private readonly api = inject(ClinicProfileApi);
  private readonly notify = inject(NotifyService);

  protected readonly text = ONLINE_PAYMENT_SETTINGS_TEXT;
  protected readonly settings = signal<OnlinePaymentSettings | null>(null);
  protected readonly form = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
    baseUrl: new FormControl<string | null>(null, [Validators.maxLength(255)]),
    source: new FormControl<string | null>(null, [Validators.maxLength(60)]),
    secretKey: new FormControl<string | null>(null, [
      Validators.maxLength(255),
      Validators.pattern(/^sk_(test|live)_\S+$/),
    ]),
    clearSecretKey: new FormControl(false, { nonNullable: true }),
  });

  async ngOnInit(): Promise<void> {
    this.apply(await firstValueFrom(this.api.onlinePayments()));
  }

  protected readonly submit = async (): Promise<OnlinePaymentSettings> => {
    const value = this.form.getRawValue();
    const saved = await firstValueFrom(
      this.api.updateOnlinePayments({ ...value, secretKey: value.secretKey?.trim() || null }),
    );
    this.apply(saved);
    this.notify.success(this.text.saved);
    return saved;
  };

  protected async copy(value: string): Promise<void> {
    await navigator.clipboard.writeText(value);
    this.notify.success(this.text.copied);
  }

  private apply(settings: OnlinePaymentSettings): void {
    this.settings.set(settings);
    this.form.reset({
      enabled: settings.enabled,
      baseUrl: settings.baseUrl,
      source: settings.source,
      secretKey: null,
      clearSecretKey: false,
    });
  }
}

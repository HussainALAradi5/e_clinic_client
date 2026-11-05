import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { CountrySelect } from '@components/common/country-select/country-select.component';
import { ClinicImageField } from '@components/settings/clinic-image-field/clinic-image-field.component';
import { OnlinePaymentSettingsCard } from '@components/settings/online-payment-settings/online-payment-settings.component';
import {
  CLINIC_IMAGE_MAX_BYTES,
  CLINIC_PROFILE_TEXT,
} from '@constants/system/clinic-profile.constants';
import { ClinicImage } from '@enums/reference/clinic-image.enum';
import { ClinicProfile } from '@interfaces/reference/clinic-profile.interface';
import { ClinicProfileApi } from '@services/reference/clinic-profile-api.service';
import { NotifyService } from '@services/ui/notify.service';

/** `/system/clinic-profile` (admins) — the letterhead of every PDF (name, tagline, contacts, logo, stamp) and online payments. */
@Component({
  selector: 'app-clinic-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ClinicImageField,
    CountrySelect,
    GenericForm,
    OnlinePaymentSettingsCard,
    PageHeader,
    TextField,
  ],
  templateUrl: './clinic-profile.page.html',
})
export class ClinicProfilePage implements OnInit {
  private readonly api = inject(ClinicProfileApi);
  private readonly notify = inject(NotifyService);

  protected readonly text = CLINIC_PROFILE_TEXT;
  protected readonly images = [ClinicImage.Logo, ClinicImage.Stamp];
  protected readonly profile = signal<ClinicProfile | null>(null);
  protected readonly busy = signal(false);
  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    tagline: new FormControl<string | null>(null, [Validators.maxLength(160)]),
    address: new FormControl<string | null>(null, [Validators.maxLength(255)]),
    countryCode: new FormControl<string | null>(null),
    phone: new FormControl<string | null>(null, [Validators.maxLength(40)]),
    email: new FormControl<string | null>(null, [Validators.email, Validators.maxLength(120)]),
    website: new FormControl<string | null>(null, [Validators.maxLength(120)]),
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  protected url(image: ClinicImage): string | null {
    const p = this.profile();
    return this.api.imageUrl(
      image === ClinicImage.Logo ? (p?.logoPath ?? null) : (p?.stampPath ?? null),
    );
  }

  protected readonly submit = async (): Promise<ClinicProfile> => {
    const saved = await firstValueFrom(this.api.update(this.form.getRawValue()));
    this.profile.set(saved);
    this.notify.success(this.text.saved);
    return saved;
  };

  protected async upload(image: ClinicImage, file: File): Promise<void> {
    if (file.size > CLINIC_IMAGE_MAX_BYTES) {
      this.notify.error(this.text.imageHint);
      return;
    }
    await this.change(
      () => firstValueFrom(this.api.uploadImage(image, file)).then(() => undefined),
      this.text.uploaded,
    );
  }

  protected remove(image: ClinicImage): Promise<void> {
    return this.change(() => firstValueFrom(this.api.removeImage(image)), this.text.removed);
  }

  private async change(request: () => Promise<void>, done: string): Promise<void> {
    this.busy.set(true);
    try {
      await request();
      this.notify.success(done);
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }

  private async load(): Promise<void> {
    const profile = await firstValueFrom(this.api.get());
    this.profile.set(profile);
    this.form.reset({
      name: profile.name,
      tagline: profile.tagline,
      address: profile.address,
      countryCode: profile.countryCode,
      phone: profile.phone,
      email: profile.email,
      website: profile.website,
    });
  }
}

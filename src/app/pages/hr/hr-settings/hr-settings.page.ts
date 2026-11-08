import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { AppButton } from '@components/common/app-button/app-button.component';
import { NumberField } from '@components/common/number-field/number-field.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { DATE_TIME_FORMAT } from '@constants/app.constants';
import { SettingKey } from '@enums/hr/setting-key.enum';
import { OvertimeBand } from '@interfaces/hr/overtime-band.interface';
import { OvertimeBandForm } from '@interfaces/hr/overtime-band-form.interface';
import { Setting } from '@interfaces/hr/setting.interface';
import { AccessService } from '@services/auth/access.service';
import { SettingApi } from '@services/hr/setting-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { AppValidators } from '@validations/validators';
import { HR_SETTINGS_TEXT } from '@constants/hr/hr-settings.constants';

/** Card look per setting: late in amber, overtime in blue (as their requests). */
const LOOK: Record<SettingKey, { icon: string; tone: string }> = {
  [SettingKey.LateExcuse]: { icon: 'running_with_errors', tone: 'late' },
  [SettingKey.Overtime]: { icon: 'more_time', tone: 'overtime' },
};

/**
 * `/hr/settings` (HR and admins) — the switches behind staff requests: late excuses (unexcused late minutes are
 * deducted) and overtime requests (overtime paid only once approved), plus the overtime pay per hour. A switch saves
 * at once; the rate saves with its button.
 */
@Component({
  selector: 'app-hr-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    AppButton,
    NumberField,
    PageHeader,
    TextField,
  ],
  templateUrl: './hr-settings.page.html',
  styleUrl: './hr-settings.page.scss',
})
export class HrSettingsPage implements OnInit {
  private readonly api = inject(SettingApi);
  private readonly notify = inject(NotifyService);

  protected readonly text = HR_SETTINGS_TEXT;
  protected readonly canEdit = inject(AccessService).can('settings.write');
  protected readonly look = LOOK;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly zone = '+0300';
  protected readonly settings = signal<Setting[]>([]);
  protected readonly saving = signal<SettingKey | null>(null);

  /** Overtime pay by time of day; minutes outside every band are paid at the hourly wage × 1.25. */
  protected readonly bands = new FormArray<FormGroup<OvertimeBandForm>>([]);

  async ngOnInit(): Promise<void> {
    const page = await firstValueFrom(this.api.list());
    this.settings.set(page.data);
    const overtime = page.data.find((s) => s.hasAmount);
    this.loadBands(overtime?.bands ?? []);
    if (!this.canEdit) this.bands.disable();
  }

  protected async toggle(setting: Setting, change: MatSlideToggleChange): Promise<void> {
    await this.save(setting, change.checked, () => (change.source.checked = setting.isEnabled));
  }

  protected addBand(): void {
    this.bands.push(this.bandGroup());
  }

  protected removeBand(index: number): void {
    this.bands.removeAt(index);
  }

  protected readonly saveRate = async (): Promise<void> => {
    const overtime = this.settings().find((s) => s.hasAmount);
    if (!overtime || this.bands.invalid) return;
    await this.save(overtime, overtime.isEnabled, undefined, true);
    this.loadBands(this.settings().find((s) => s.hasAmount)?.bands ?? []);
  };

  private bandGroup(band?: OvertimeBand): FormGroup<OvertimeBandForm> {
    return new FormGroup<OvertimeBandForm>({
      start: new FormControl(band?.start ?? null, Validators.required),
      end: new FormControl(band?.end ?? null, Validators.required),
      rate: new FormControl(band?.rate.amount ?? null, [Validators.required, AppValidators.money]),
    });
  }

  private loadBands(bands: OvertimeBand[]): void {
    this.bands.clear();
    bands.forEach((band) => this.bands.push(this.bandGroup(band)));
  }

  private async save(
    setting: Setting,
    enabled: boolean,
    undo?: () => void,
    withBands = false,
  ): Promise<void> {
    this.saving.set(setting.key);
    try {
      const saved = await firstValueFrom(
        this.api.save(setting.key, {
          isEnabled: enabled,
          ...(withBands
            ? {
                bands: this.bands.getRawValue().map((band) => ({
                  start: band.start ?? '',
                  end: band.end ?? '',
                  rate: band.rate ?? '',
                })),
              }
            : {}),
        }),
      );
      this.settings.update((list) => list.map((s) => (s.key === saved.key ? saved : s)));
      this.notify.success(`${saved.label} ${saved.isEnabled ? 'on' : 'off'}.`);
    } catch (e) {
      undo?.();
      throw e;
    } finally {
      this.saving.set(null);
    }
  }
}

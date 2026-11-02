import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { AppButton } from '@components/common/app-button/app-button.component';
import { MoneyInput } from '@components/common/money-input/money-input.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { DATE_TIME_FORMAT } from '@constants/app.constants';
import { SettingKey } from '@enums/hr/setting-key.enum';
import { Setting } from '@interfaces/hr/setting.interface';
import { AccessService } from '@services/auth/access.service';
import { SettingApi } from '@services/hr/setting-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { AppValidators } from '@validations/validators';

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
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    AppButton,
    MoneyInput,
    PageHeader,
  ],
  templateUrl: './hr-settings.page.html',
  styleUrl: './hr-settings.page.scss',
})
export class HrSettingsPage implements OnInit {
  private readonly api = inject(SettingApi);
  private readonly notify = inject(NotifyService);

  protected readonly canEdit = inject(AccessService).can('settings.write');
  protected readonly look = LOOK;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly zone = '+0300';
  protected readonly settings = signal<Setting[]>([]);
  protected readonly saving = signal<SettingKey | null>(null);
  /** Overtime pay per hour; empty = the employee's hourly wage × 1.25. */
  protected readonly rate = new FormControl<string | null>(null, [
    Validators.min(0),
    Validators.max(1000),
    AppValidators.money,
  ]);

  async ngOnInit(): Promise<void> {
    const page = await firstValueFrom(this.api.list());
    this.settings.set(page.data);
    this.rate.setValue(page.data.find((s) => s.hasAmount)?.amount?.amount ?? null);
    if (!this.canEdit) this.rate.disable();
  }

  protected async toggle(setting: Setting, change: MatSlideToggleChange): Promise<void> {
    await this.save(setting, change.checked, () => (change.source.checked = setting.isEnabled));
  }

  protected readonly saveRate = async (): Promise<void> => {
    const overtime = this.settings().find((s) => s.hasAmount);
    if (!overtime || this.rate.invalid) return;
    await this.save(overtime, overtime.isEnabled);
  };

  private async save(setting: Setting, enabled: boolean, undo?: () => void): Promise<void> {
    this.saving.set(setting.key);
    try {
      const saved = await firstValueFrom(
        this.api.save(setting.key, {
          isEnabled: enabled,
          ...(setting.hasAmount ? { amount: this.rate.value || null } : {}),
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

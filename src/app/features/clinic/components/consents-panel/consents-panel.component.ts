import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConsentDialogData } from '../../interfaces/dialog-data.interface';
import { ClinicalActions } from '../../services/clinical-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { PatientConsent } from '@shared/interfaces/clinic/consent.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { ConsentApi } from '@shared/services/clinic/consent-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';

/** The patient's consents with validity; record, print and revoke (patient file tab and visit workspace). */
@Component({
  selector: 'app-consents-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButton, MatIconModule, RouterLink, EnumLabelPipe, DatePipe],
  host: { class: 'block' },
  templateUrl: './consents-panel.component.html',
})
export class ConsentsPanel implements OnInit {
  /** Patient and the visit / treatment / order a new consent may cover. */
  readonly context = input.required<ConsentDialogData>();

  private readonly api = inject(ConsentApi);
  private readonly actions = inject(ClinicalActions);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  protected readonly consents = signal<PatientConsent[] | null>(null);
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.consents.set(
      await firstValueFrom(this.api.list(this.context().patient.id)).catch(() => []),
    );
  }

  protected readonly record = async (): Promise<void> => {
    if (await this.actions.recordConsent(this.context())) await this.load();
  };

  protected readonly revoke = async (consent: PatientConsent): Promise<void> => {
    const reason = await this.dialogs.reason({
      title: `Revoke ${consent.code}?`,
      message: 'Work that needs this consent is blocked from now on.',
      confirmLabel: 'Revoke',
      danger: true,
    });
    if (!reason) return;
    await firstValueFrom(this.api.revoke(consent.id, reason));
    this.notify.success('Consent revoked.');
    await this.load();
  };
}

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConsentDialogData } from '@interfaces/clinic/consent-dialog-data.interface';
import { ClinicalActions } from '@services/clinic/clinical-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { ButtonVariant } from '@enums/ui/button.enum';
import { PatientConsent } from '@interfaces/clinic/consent.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { ConsentApi } from '@services/clinic/consent-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { CONSENTS_PANEL_TEXT } from '@constants/clinic/consents-panel.constants';

/** The patient's consents with validity; record, print and revoke (patient file tab and visit workspace). */
@Component({
  selector: 'app-consents-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButton, MatIconModule, RouterLink, EnumLabelPipe, DatePipe],
  host: { class: 'block' },
  templateUrl: './consents-panel.component.html',
})
export class ConsentsPanel implements OnInit {
  protected readonly text = CONSENTS_PANEL_TEXT;

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
      title: CONSENTS_PANEL_TEXT.revoke2(consent.code),
      message: CONSENTS_PANEL_TEXT.workThatNeedsThisConsent,
      confirmLabel: CONSENTS_PANEL_TEXT.revoke,
      danger: true,
    });
    if (!reason) return;
    await firstValueFrom(this.api.revoke(consent.id, reason));
    this.notify.success(CONSENTS_PANEL_TEXT.consentRevoked);
    await this.load();
  };
}

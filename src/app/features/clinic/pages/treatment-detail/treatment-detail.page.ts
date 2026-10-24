import { DatePipe, formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProgressMeter } from '@shared/components/progress-meter/progress-meter.component';
import { ClinicalActions } from '../../services/clinical-actions.service';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { AuditHistory } from '@shared/components/audit-history/audit-history.component';
import { EntityActions } from '@shared/components/entity-actions/entity-actions.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Facts } from '@shared/components/facts/facts.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { isOpenGenericStatus } from '@shared/enums/shared/generic-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { TreatmentSession } from '@shared/interfaces/clinic/treatment.interface';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { TreatmentApi } from '@shared/services/clinic/treatment-api.service';
import { EntityDetail } from '@shared/services/data/entity-detail';
import { EnumService } from '@shared/services/data/enum.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { formatMoney } from '@shared/utils/money';

/** `/clinic/treatments/:id` — progress, sessions (each opens its booking and visit note), plan details and history. */
@Component({
  selector: 'app-treatment-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    EntityActions,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    ProgressMeter,
    AuditHistory,
    HasAccessDirective,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './treatment-detail.page.html',
})
export class TreatmentDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(TreatmentApi);
  protected readonly detail = new EntityDetail(this.api);
  private readonly actions = inject(ClinicalActions);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  private readonly enums = inject(EnumService);

  protected readonly sessions = signal<TreatmentSession[]>([]);
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly open = computed(() => isOpenGenericStatus(this.detail.record()?.status));
  protected readonly facts = computed<Fact[]>(() => {
    const t = this.detail.record();
    if (!t) return [];
    return [
      { label: 'Type', value: this.enums.label('TreatmentType', t.type) },
      {
        label: 'Responsible doctor',
        value: t.doctor
          ? `${t.doctor.fullName}${t.doctor.specialty ? ' · ' + t.doctor.specialty : ''}`
          : null,
      },
      { label: 'Prescribed in visit', value: t.appointment?.code },
      { label: 'Session length', value: `${t.sessionDurationMinutes} min` },
      {
        label: 'Billed per session',
        value: t.billableService
          ? `${t.billableService.name} · ${formatMoney(t.billableService.price)}`
          : 'Not billed',
      },
      {
        label: 'Started',
        value: t.startDate ? formatDate(t.startDate, DATE_FORMAT, 'en-GB') : null,
      },
      { label: 'Ended', value: t.endDate ? formatDate(t.endDate, DATE_FORMAT, 'en-GB') : null },
      { label: 'Cancellation reason', value: t.cancellationReason },
    ].filter((f) => f.value !== null && f.value !== undefined);
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    await this.detail.load(this.id());
    this.sessions.set(await firstValueFrom(this.api.sessions(this.id())).catch(() => []));
  }

  protected readonly book = async (): Promise<void> => {
    const t = this.detail.record();
    if (t && (await this.actions.bookSession(t))) await this.load();
  };

  protected readonly changePriority = async (): Promise<void> => {
    const t = this.detail.record();
    const saved = t ? await this.actions.changePriority(t) : undefined;
    if (saved) this.detail.set(saved);
  };

  protected readonly edit = async (): Promise<void> => {
    const t = this.detail.record();
    if (t && (await this.actions.editTreatment(t))) await this.load();
  };

  protected readonly complete = async (): Promise<void> => {
    await firstValueFrom(this.api.complete(this.id()));
    this.notify.success('Treatment completed — remaining bookings were cancelled.');
    await this.load();
  };

  protected readonly cancel = async (): Promise<void> => {
    const reason = await this.dialogs.reason({
      title: 'Cancel this treatment?',
      message: 'Booked sessions are cancelled and the patient is told.',
      confirmLabel: 'Cancel treatment',
      danger: true,
    });
    if (!reason) return;
    await firstValueFrom(this.api.cancel(this.id(), reason));
    this.notify.success('Treatment cancelled.');
    await this.load();
  };

  protected readonly archive = async (): Promise<void> => {
    await this.detail.archive();
    this.notify.success('Treatment archived.');
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.detail.unarchive();
    this.notify.success('Treatment back in lists.');
  };

  protected readonly restore = async (): Promise<void> => {
    await this.detail.restore();
    this.notify.success('Treatment restored.');
  };

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success('Treatment deleted.');
    await this.router.navigateByUrl('/clinic/treatments');
  };
}

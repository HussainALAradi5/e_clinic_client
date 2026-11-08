import { ClockPipe } from '@pipes/clock.pipe';
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
import { ProgressMeter } from '@components/common/progress-meter/progress-meter.component';
import { ClinicalActions } from '@services/clinic/clinical-actions.service';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { EntityActions } from '@components/common/entity-actions/entity-actions.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { isOpenGenericStatus } from '@enums/shared/generic-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { TreatmentSession } from '@interfaces/clinic/treatment-session.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { TreatmentApi } from '@services/clinic/treatment-api.service';
import { EntityDetail } from '@services/data/entity-detail';
import { EnumService } from '@services/data/enum.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { formatMoney } from '@utilities/money';
import { TREATMENT_DETAIL_TEXT } from '@constants/clinic/treatment-detail.constants';

/** `/clinic/treatments/:id` — progress, sessions (each opens its booking and visit note), plan details and history. */
@Component({
  selector: 'app-treatment-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ClockPipe,
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
  protected readonly text = TREATMENT_DETAIL_TEXT;

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
      { label: TREATMENT_DETAIL_TEXT.type, value: this.enums.label('TreatmentType', t.type) },
      {
        label: TREATMENT_DETAIL_TEXT.responsibleDoctor,
        value: t.doctor
          ? `${t.doctor.fullName}${t.doctor.specialty ? ' · ' + t.doctor.specialty : ''}`
          : null,
      },
      { label: TREATMENT_DETAIL_TEXT.prescribedInVisit, value: t.appointment?.code },
      { label: TREATMENT_DETAIL_TEXT.sessionLength, value: `${t.sessionDurationMinutes} min` },
      {
        label: TREATMENT_DETAIL_TEXT.billedPerSession,
        value: t.billableService
          ? `${t.billableService.name} · ${formatMoney(t.billableService.price)}`
          : TREATMENT_DETAIL_TEXT.notBilled,
      },
      {
        label: TREATMENT_DETAIL_TEXT.started,
        value: t.startDate ? formatDate(t.startDate, DATE_FORMAT, 'en-GB') : null,
      },
      {
        label: TREATMENT_DETAIL_TEXT.ended,
        value: t.endDate ? formatDate(t.endDate, DATE_FORMAT, 'en-GB') : null,
      },
      { label: TREATMENT_DETAIL_TEXT.cancellationReason, value: t.cancellationReason },
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
    this.notify.success(TREATMENT_DETAIL_TEXT.treatmentCompletedRemainingBookingsWere);
    await this.load();
  };

  protected readonly cancel = async (): Promise<void> => {
    const reason = await this.dialogs.reason({
      title: TREATMENT_DETAIL_TEXT.cancelThisTreatment,
      message: TREATMENT_DETAIL_TEXT.bookedSessionsAreCancelledAnd,
      confirmLabel: TREATMENT_DETAIL_TEXT.cancelTreatment,
      danger: true,
    });
    if (!reason) return;
    await firstValueFrom(this.api.cancel(this.id(), reason));
    this.notify.success(TREATMENT_DETAIL_TEXT.treatmentCancelled);
    await this.load();
  };

  protected readonly archive = async (): Promise<void> => {
    await this.detail.archive();
    this.notify.success(TREATMENT_DETAIL_TEXT.treatmentArchived);
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.detail.unarchive();
    this.notify.success(TREATMENT_DETAIL_TEXT.treatmentBackInLists);
  };

  protected readonly restore = async (): Promise<void> => {
    await this.detail.restore();
    this.notify.success(TREATMENT_DETAIL_TEXT.treatmentRestored);
  };

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success(TREATMENT_DETAIL_TEXT.treatmentDeleted);
    await this.router.navigateByUrl('/clinic/treatments');
  };
}

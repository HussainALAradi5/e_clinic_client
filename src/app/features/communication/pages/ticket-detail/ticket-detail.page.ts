import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { EMPTY, filter, firstValueFrom, merge, switchMap } from 'rxjs';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Facts } from '@shared/components/facts/facts.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { SupportTicket } from '@shared/interfaces/communication/ticket.interface';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { AccessService } from '@shared/services/auth/access.service';
import { AuthStore } from '@shared/services/auth/auth.store';
import { RealtimeService } from '@shared/services/communication/realtime.service';
import { TicketApi } from '@shared/services/communication/ticket-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { clinicDateTime } from '@shared/utils/clinic-time';
import { initials } from '../../utils/chat-style';

interface StatusAction {
  to: GenericStatus;
  label: string;
  icon: string;
  variant: ButtonVariant;
  run?: () => Promise<void>;
}

/**
 * `/support/tickets/:id` — the ticket with its status, priority and category badges, who opened and took it,
 * the conversation, and for admins the next steps of the ticket flow (take it, mark solved, reopen, cancel).
 * Live: changes by anyone else reload it.
 */
@Component({
  selector: 'app-ticket-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './ticket-detail.page.html',
  styleUrl: './ticket-detail.page.scss',
})
export class TicketDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(TicketApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly access = inject(AccessService);

  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly ticket = signal<SupportTicket | null>(null);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly reply = signal('');
  protected readonly initials = initials;

  protected readonly desk = computed(() => this.access.can('tickets.resolve'));
  protected readonly closed = computed(() => this.ticket()?.status === GenericStatus.Cancelled);

  /** The admins' buttons, in the order of the flow, for the moves the server allows from here. */
  protected readonly actions = computed<StatusAction[]>(() => {
    const t = this.ticket();
    if (!t || !this.desk()) return [];
    const all: StatusAction[] = [
      {
        to: GenericStatus.InProgress,
        label: 'Take it',
        icon: 'assignment_ind',
        variant: ButtonVariant.Tonal,
      },
      {
        to: GenericStatus.Completed,
        label: 'Mark solved',
        icon: 'task_alt',
        variant: ButtonVariant.Filled,
      },
      {
        to: GenericStatus.Pending,
        label: t.status === GenericStatus.Completed ? 'Reopen' : 'Back to queue',
        icon: t.status === GenericStatus.Completed ? 'replay' : 'undo',
        variant: ButtonVariant.Outlined,
      },
      {
        to: GenericStatus.Cancelled,
        label: 'Cancel ticket',
        icon: 'block',
        variant: ButtonVariant.Danger,
      },
    ];
    return all
      .filter((a) => t.allowedTransitions.includes(a.to))
      .map((a) => ({ ...a, run: this.move(a) }));
  });

  protected readonly facts = computed<Fact[]>(() => {
    const t = this.ticket();
    if (!t) return [];
    return [
      { label: 'Ticket', value: t.code, mono: true },
      { label: 'Status', value: t.status, enum: 'GenericStatus' },
      { label: 'Priority', value: t.priority, enum: 'TreatmentPriority' },
      { label: 'Category', value: t.category, enum: 'TicketCategory' },
      { label: 'Opened by', value: t.requester?.fullName },
      { label: 'Opened', value: clinicDateTime(t.createdAt) },
      { label: 'Taken by', value: t.assignee?.fullName ?? 'Not taken yet' },
      { label: 'Solved by', value: t.resolver?.fullName },
      { label: 'Solved', value: clinicDateTime(t.resolvedAt) },
    ].filter((f) => f.value !== null && f.value !== undefined);
  });

  constructor() {
    const realtime = inject(RealtimeService);
    const auth = inject(AuthStore);
    toObservable(computed(() => ({ me: auth.user()?.id, desk: this.desk() })))
      .pipe(
        switchMap(({ me, desk }) =>
          me
            ? merge(
                realtime.listen<{ id?: string; ticket?: { id: string } }>(
                  `user.${me}`,
                  'ticket.changed',
                ),
                desk
                  ? realtime.listen<{ id?: string; ticket?: { id: string } }>(
                      'support',
                      'ticket.changed',
                    )
                  : EMPTY,
              )
            : EMPTY,
        ),
        filter((e) => (e.ticket?.id ?? e.id) === this.id()),
        takeUntilDestroyed(),
      )
      .subscribe(() => void this.load(true));
  }

  ngOnInit(): void {
    void this.load();
  }

  protected async load(quiet = false): Promise<void> {
    try {
      this.ticket.set(await firstValueFrom(this.api.get(this.id(), quiet)));
      this.error.set(null);
    } catch (e) {
      this.error.set(e as ApiError);
    }
  }

  protected readonly send = async (): Promise<void> => {
    const body = this.reply().trim();
    if (!body) return;
    await firstValueFrom(this.api.comment(this.id(), body));
    this.reply.set('');
    await this.load(true);
  };

  protected move(action: StatusAction): () => Promise<void> {
    return async () => {
      const t = this.ticket();
      if (!t) return;
      let resolution: string | undefined;
      if (action.to === GenericStatus.Completed) {
        const answer = await this.dialogs.reason({
          title: 'Mark this ticket solved?',
          message: `${t.requester?.fullName ?? 'The requester'} is told, with what you write here.`,
          reasonLabel: 'What was done',
          confirmLabel: 'Mark solved',
        });
        if (!answer) return;
        resolution = answer;
      } else if (action.to === GenericStatus.Cancelled) {
        const ok = await this.dialogs.confirm({
          title: 'Cancel this ticket?',
          message: 'A cancelled ticket is final: no more replies or status changes.',
          confirmLabel: 'Cancel ticket',
          danger: true,
        });
        if (!ok) return;
      }
      this.ticket.set(await firstValueFrom(this.api.setStatus(t, action.to, resolution)));
      this.notify.success(`${t.code}: ${action.label.toLowerCase()} — done.`);
    };
  }
}

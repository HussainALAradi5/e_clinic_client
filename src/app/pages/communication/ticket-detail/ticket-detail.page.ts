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
import { AppButton } from '@components/common/app-button/app-button.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_TIME_FORMAT } from '@constants/app.constants';
import { AttachmentCategory } from '@enums/attachment/attachment-category.enum';
import { TicketConfirmation } from '@enums/communication/ticket.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { ApiError } from '@interfaces/api/api-error.interface';
import { SupportTicket } from '@interfaces/communication/ticket.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { AccessService } from '@services/auth/access.service';
import { AuthStore } from '@services/auth/auth.store';
import { RealtimeService } from '@services/communication/realtime.service';
import { TicketApi } from '@services/communication/ticket-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { clinicDateTime } from '@utilities/clinic-time';
import { initials } from '@utilities/communication/chat-style';
import { SolveTicketDialog } from '@components/communication/solve-ticket-dialog/solve-ticket-dialog.component';
import {
  SolveTicketData,
  TicketSolution,
} from '@interfaces/communication/solve-ticket-dialog.interface';
import { UploadZone } from '@components/common/upload-zone/upload-zone.component';
import { StatusAction } from '@interfaces/communication/ticket-detail.interface';

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
    UploadZone,
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
  private readonly me = inject(AuthStore).user;
  protected readonly ticketFile = AttachmentCategory.TicketAttachment;
  protected readonly owner = computed(() => ({ type: 'support_ticket', id: this.id() }));
  /** I opened it, it is solved, and it waits for my answer. */
  protected readonly askMe = computed(() => {
    const t = this.ticket();
    return (
      !!t &&
      t.requester?.id === this.me()?.id &&
      t.status === GenericStatus.Completed &&
      t.confirmation === TicketConfirmation.Awaiting
    );
  });
  /** The requester and the desk add files while the ticket is open. */
  protected readonly canAttach = computed(() => {
    const t = this.ticket();
    return (
      !!t &&
      t.status !== GenericStatus.Cancelled &&
      (this.desk() || t.requester?.id === this.me()?.id)
    );
  });
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
      { label: 'Requester answer', value: t.confirmation, enum: 'TicketConfirmation' },
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

  protected readonly confirmFixed = async (): Promise<void> => {
    this.ticket.set(await firstValueFrom(this.api.confirm(this.id())));
    this.notify.success('Thanks — the support team is told it works.');
  };

  protected readonly declineFix = async (): Promise<void> => {
    const reason = await this.dialogs.reason({
      title: 'Still not fixed?',
      message: 'Say what still happens; the ticket goes back to the support team.',
      reasonLabel: 'What still happens',
      confirmLabel: 'Not fixed',
      danger: true,
    });
    if (!reason) return;
    this.ticket.set(await firstValueFrom(this.api.decline(this.id(), reason)));
    this.notify.success('Sent back to the support team.');
  };

  protected isImage(mime: string): boolean {
    return mime.startsWith('image/');
  }

  protected move(action: StatusAction): () => Promise<void> {
    return async () => {
      const t = this.ticket();
      if (!t) return;
      let solution: TicketSolution | undefined;
      if (action.to === GenericStatus.Completed) {
        solution = await this.dialogs.open<SolveTicketDialog, SolveTicketData, TicketSolution>(
          SolveTicketDialog,
          { code: t.code, requester: t.requester?.fullName ?? 'The requester' },
          { width: '600px' },
        );
        if (!solution) return;
      } else if (action.to === GenericStatus.Cancelled) {
        const ok = await this.dialogs.confirm({
          title: 'Cancel this ticket?',
          message: 'A cancelled ticket is final: no more replies or status changes.',
          confirmLabel: 'Cancel ticket',
          danger: true,
        });
        if (!ok) return;
      }
      this.ticket.set(await firstValueFrom(this.api.setStatus(t, action.to, solution)));
      this.notify.success(`${t.code}: ${action.label.toLowerCase()} — done.`);
    };
  }
}

import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { ConversationType } from '@enums/communication/chat.enum';
import { ChatContact, Conversation } from '@interfaces/communication/chat.interface';
import { ChatApi } from '@services/communication/chat-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { ChatAvatar } from '../chat-avatar/chat-avatar.component';

/** Start a one-to-one chat with a colleague, or a group (you become its leader). Closes with the chat. */
@Component({
  selector: 'app-new-chat-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    EnumLabelPipe,
    ChatAvatar,
  ],
  template: `
    <h2 mat-dialog-title>New chat</h2>
    <mat-dialog-content class="!pt-1">
      <mat-button-toggle-group [(ngModel)]="type" aria-label="Chat type" class="mb-3 w-full">
        <mat-button-toggle class="flex-1" [value]="types.Direct"
          ><mat-icon>person</mat-icon> One-to-one</mat-button-toggle
        >
        <mat-button-toggle class="flex-1" [value]="types.Group"
          ><mat-icon>groups</mat-icon> Group</mat-button-toggle
        >
      </mat-button-toggle-group>

      @if (type === types.Group) {
        <mat-form-field class="w-full">
          <mat-label>Group name</mat-label>
          <input matInput [(ngModel)]="title" maxlength="100" required />
        </mat-form-field>
      }
      <mat-form-field class="w-full" subscriptSizing="dynamic">
        <mat-label>Find a colleague</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput (input)="search$.next($any($event.target).value)" />
      </mat-form-field>

      <ul class="m-0 mt-2 max-h-80 list-none overflow-y-auto p-0">
        @for (c of contacts(); track c.id) {
          <li>
            @if (type === types.Group) {
              <mat-checkbox class="w-full" [checked]="picked().has(c.id)" (change)="toggle(c.id)">
                <span class="flex items-center gap-3 py-1">
                  <app-chat-avatar
                    [name]="c.fullName"
                    [id]="c.id"
                    [url]="c.avatarUrl"
                    [size]="34"
                  />
                  <span>
                    <span class="block font-medium">{{ c.fullName }}</span>
                    <span class="block text-xs text-on-surface-variant">{{
                      c.userType | enumLabel: 'UserType'
                    }}</span>
                  </span>
                </span>
              </mat-checkbox>
            } @else {
              <button
                type="button"
                class="flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-2 py-2 text-left text-on-surface hover:bg-surface-container-high"
                (click)="direct(c)"
              >
                <app-chat-avatar [name]="c.fullName" [id]="c.id" [url]="c.avatarUrl" [size]="38" />
                <span>
                  <span class="block font-medium">{{ c.fullName }}</span>
                  <span class="block text-xs text-on-surface-variant">{{
                    c.userType | enumLabel: 'UserType'
                  }}</span>
                </span>
              </button>
            }
          </li>
        } @empty {
          <li class="py-6 text-center text-sm text-on-surface-variant">No colleagues found.</li>
        }
      </ul>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close>Cancel</button>
      @if (type === types.Group) {
        <button
          matButton="filled"
          [disabled]="!title.trim() || !picked().size || busy()"
          (click)="group()"
        >
          Create group ({{ picked().size }})
        </button>
      }
    </mat-dialog-actions>
  `,
})
export class NewChatDialog implements OnInit {
  private readonly ref = inject(MatDialogRef<NewChatDialog, Conversation>);
  private readonly api = inject(ChatApi);
  private readonly notify = inject(NotifyService);

  protected readonly types = ConversationType;
  protected type = ConversationType.Direct;
  protected title = '';
  protected readonly contacts = signal<ChatContact[]>([]);
  protected readonly picked = signal(new Set<string>());
  protected readonly busy = signal(false);
  protected readonly search$ = new Subject<string>();

  constructor() {
    this.search$
      .pipe(
        debounceTime(250),
        switchMap((q) => this.api.contacts(q)),
        takeUntilDestroyed(),
      )
      .subscribe((list) => this.contacts.set(list));
  }

  ngOnInit(): void {
    this.search$.next('');
  }

  protected toggle(id: string): void {
    this.picked.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected direct(contact: ChatContact): void {
    this.run(this.api.start({ type: ConversationType.Direct, userId: contact.id }));
  }

  protected group(): void {
    this.run(
      this.api.start({
        type: ConversationType.Group,
        title: this.title.trim(),
        memberIds: [...this.picked()],
      }),
    );
  }

  private run(request: ReturnType<ChatApi['start']>): void {
    this.busy.set(true);
    request.subscribe({
      next: (chat) => this.ref.close(chat),
      error: (e: unknown) => {
        this.busy.set(false);
        this.notify.error(e);
      },
    });
  }
}

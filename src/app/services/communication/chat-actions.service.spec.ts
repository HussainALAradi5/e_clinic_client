import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConversationType } from '@enums/communication/chat.enum';
import { Conversation } from '@interfaces/communication/conversation.interface';
import { DialogService } from '@services/ui/dialog.service';
import { ChatActions } from './chat-actions.service';

const chat = (over: Partial<Conversation>): Conversation =>
  ({
    id: 'c-1',
    type: ConversationType.Direct,
    title: 'Omar',
    left: false,
    deletedAt: null,
    ...over,
  }) as Conversation;

describe('ChatActions', () => {
  let actions: ChatActions;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    actions = TestBed.inject(ChatActions);
    http = TestBed.inject(HttpTestingController);
  });

  it('deletes a one-to-one chat any time, a group only after leaving it', () => {
    const group = chat({ type: ConversationType.Group, title: 'Ward 3' });
    expect(actions.canDelete(chat({}))).toBe(true);
    expect(actions.canDelete(group)).toBe(false);
    expect(actions.canLeave(group)).toBe(true);

    const left = { ...group, left: true };
    expect(actions.canDelete(left)).toBe(true);
    expect(actions.canLeave(left)).toBe(false);
    expect(actions.canMute(left)).toBe(false);

    const gone = chat({ deletedAt: '2026-11-05T10:00:00+03:00' });
    expect(actions.canDelete(gone)).toBe(false);
    expect(actions.canMute(gone)).toBe(false);
  });

  it('asks before deleting, then deletes the chat from my list only', async () => {
    vi.spyOn(TestBed.inject(DialogService), 'confirm').mockResolvedValue(true);
    const done = actions.deleteForMe(chat({}));
    await Promise.resolve();
    const call = http.expectOne((r) => r.url.endsWith('chat/conversations/c-1'));
    expect(call.request.method).toBe('DELETE');
    call.flush(null);
    expect(await done).toBe(true);
  });

  it('does nothing when the confirmation is declined', async () => {
    vi.spyOn(TestBed.inject(DialogService), 'confirm').mockResolvedValue(false);
    expect(await actions.deleteForMe(chat({}))).toBe(false);
    http.expectNone((r) => r.url.includes('chat/conversations'));
  });
});

import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { silent } from '@middlewares/interceptors/http-context';
import { ParticipantRole } from '@enums/communication/participant-role.enum';
import { Page } from '@interfaces/api/page.interface';
import { ChatContact } from '@interfaces/communication/chat.interface';
import { ChatMessage } from '@interfaces/communication/chat-message.interface';
import { ChatSettings } from '@interfaces/communication/chat-settings.interface';
import { Conversation } from '@interfaces/communication/conversation.interface';
import { ConversationQuery } from '@interfaces/communication/conversation-query.interface';
import { NewChatPayload } from '@interfaces/communication/new-chat-payload.interface';
import { SendMessagePayload } from '@interfaces/communication/send-message-payload.interface';
import { ApiClient } from '@services/api/api-client.service';
import { ENDPOINTS } from '@config/endpoints';

/** Staff chat — my chats (filtered on the server), messages, reactions, groups and my chat settings. */
@Injectable({ providedIn: 'root' })
export class ChatApi {
  private readonly api = inject(ApiClient);
  private readonly path = ENDPOINTS.chat.root;

  conversations(query: ConversationQuery, quiet = false): Observable<Page<Conversation>> {
    const { page, perPage, ...filters } = query;
    return this.api.list<Conversation>(
      `${this.path}/conversations`,
      { page, perPage },
      { ...filters },
      quiet ? silent() : undefined,
    );
  }

  conversation(id: string): Observable<Conversation> {
    return this.api.get<Conversation>(`${this.path}/conversations/${id}`, { context: silent() });
  }

  start(payload: NewChatPayload): Observable<Conversation> {
    return this.api.post<Conversation>(`${this.path}/conversations`, payload);
  }

  /** Newest first, 50 at a time; `before` (a message id) loads older ones. */
  messages(id: string, before?: string): Observable<{ data: ChatMessage[]; hasMore: boolean }> {
    return this.api
      .list<ChatMessage>(`${this.path}/conversations/${id}/messages`, {}, { before })
      .pipe(
        map((page) => ({
          data: page.data,
          hasMore: !!(page.meta as { hasMore?: boolean }).hasMore,
        })),
      );
  }

  /** Multipart: text, files (or one voice note), mentions and the message it answers. */
  send(id: string, payload: SendMessagePayload): Observable<ChatMessage> {
    const form = new FormData();
    if (payload.body) form.append('body', payload.body);
    payload.files?.forEach((file) => form.append('files[]', file, file.name));
    if (payload.voice) form.append('voice', '1');
    payload.mentions?.forEach((userId) => form.append('mentions[]', userId));
    if (payload.replyToId) form.append('reply_to_id', payload.replyToId);
    return this.api.post<ChatMessage>(`${this.path}/conversations/${id}/messages`, form, {
      context: silent(),
    });
  }

  /** The same emoji again (or null) takes my reaction back. */
  react(id: string, messageId: string, emoji: string | null): Observable<ChatMessage> {
    return this.api.post<ChatMessage>(
      `${this.path}/conversations/${id}/messages/${messageId}/reactions`,
      { emoji },
      { context: silent() },
    );
  }

  markRead(id: string): Observable<void> {
    return this.api
      .post<null>(`${this.path}/conversations/${id}/read`, {}, { context: silent() })
      .pipe(map(() => undefined));
  }

  unread(): Observable<number> {
    return this.api
      .get<{ count: number }>(`${this.path}/unread`, { context: silent() })
      .pipe(map((r) => r.count));
  }

  contacts(search = ''): Observable<ChatContact[]> {
    return this.api.get<ChatContact[]>(`${this.path}/contacts`, {
      params: new HttpParams().set('search', search),
      context: silent(),
    });
  }

  rename(id: string, title: string): Observable<Conversation> {
    return this.api.patch<Conversation>(`${this.path}/conversations/${id}`, { title });
  }

  addMembers(id: string, userIds: string[]): Observable<Conversation> {
    return this.api.post<Conversation>(`${this.path}/conversations/${id}/members`, { userIds });
  }

  setRole(id: string, userId: string, role: ParticipantRole): Observable<Conversation> {
    return this.api.patch<Conversation>(`${this.path}/conversations/${id}/members/${userId}`, {
      role,
    });
  }

  /** Soft delete: the chat leaves its members' lists (either person in a one-to-one chat, a leader in a group). */
  remove(id: string): Observable<void> {
    return this.api.delete(`${this.path}/conversations/${id}`);
  }

  /** Admins bring a deleted chat back to its members. */
  restore(id: string): Observable<Conversation> {
    return this.api.patch<Conversation>(`${this.path}/conversations/${id}/restore`, {});
  }

  /** An admin removes a member, or I leave (my own id). */
  removeMember(id: string, userId: string): Observable<void> {
    return this.api.delete(`${this.path}/conversations/${id}/members/${userId}`);
  }

  settings(): Observable<ChatSettings> {
    return this.api.get<ChatSettings>(`${this.path}/settings`, { context: silent() });
  }

  saveSettings(values: Partial<ChatSettings>): Observable<ChatSettings> {
    return this.api.put<ChatSettings>(`${this.path}/settings`, values, { context: silent() });
  }
}

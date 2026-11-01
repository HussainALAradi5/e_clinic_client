import { Routes } from '@angular/router';
import { accessGuard } from '@core/guards/auth.guards';

/** `/chat` — staff chat (lazy); `/support` — support tickets. */
export const CHAT_ROUTES: Routes = [
  {
    path: '',
    title: 'Chat · e-Clinic',
    canMatch: [accessGuard('chat.read_own | chat.read_all')],
    loadComponent: () => import('./pages/chat/chat.page').then((m) => m.ChatPage),
  },
];

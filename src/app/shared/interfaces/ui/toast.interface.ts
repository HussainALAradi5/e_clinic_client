import { ToastType } from '@shared/enums/ui/toast-type.enum';

/** What one toast shows (passed to the toast component as MAT_SNACK_BAR_DATA). */
export interface ToastData {
  type: ToastType;
  title: string;
  message: string;
  /** Optional action button, e.g. Undo. */
  action?: string;
  /** Auto-close after this many ms (drives the countdown line). */
  duration: number;
}

/** Look and timing of a toast type. */
export interface ToastStyle {
  icon: string;
  title: string;
  duration: number;
  politeness: 'polite' | 'assertive';
}

/** Optional overrides for NotifyService calls. */
export interface ToastOptions {
  title?: string;
  action?: string;
  duration?: number;
}

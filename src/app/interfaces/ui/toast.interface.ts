import { ToastType } from '@enums/ui/toast-type.enum';

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

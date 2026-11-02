export interface ConfirmConfig {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for destructive actions. */
  danger?: boolean;
  /** Ask for a reason (cancel / reject / void / revoke) — the dialog then resolves to the reason. */
  reason?: boolean;
  reasonLabel?: string;
  /** For large bulk actions: the user must type this number to confirm. */
  typeToConfirm?: string;
}

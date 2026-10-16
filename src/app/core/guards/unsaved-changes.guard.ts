import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { HasUnsavedChanges } from '@shared/interfaces/ui/unsaved-changes.interface';
import { DialogService } from '@shared/services/ui/dialog.service';

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  !component.hasUnsavedChanges() ||
  inject(DialogService).confirm({
    title: 'Discard changes?',
    message: 'You have unsaved changes on this page.',
    confirmLabel: 'Discard',
    danger: true,
  });

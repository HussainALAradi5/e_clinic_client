import { GenericStatus } from '@enums/shared/generic-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';

export interface StatusAction {
  to: GenericStatus;
  label: string;
  icon: string;
  variant: ButtonVariant;
  run?: () => Promise<void>;
}

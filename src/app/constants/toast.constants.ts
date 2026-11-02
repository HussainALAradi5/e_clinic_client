import { ToastType } from '@enums/ui/toast-type.enum';
import { ToastStyle } from '@interfaces/ui/toast.interface';

/** One entry per toast type; colours live in styles/_brand.scss under `.toast-<type>`. */
export const TOAST_STYLES: Record<ToastType, ToastStyle> = {
  [ToastType.Success]: {
    icon: 'check_circle',
    title: 'Done',
    duration: 3500,
    politeness: 'polite',
  },
  [ToastType.Info]: {
    icon: 'info',
    title: 'For your information',
    duration: 5000,
    politeness: 'polite',
  },
  [ToastType.Warning]: {
    icon: 'warning',
    title: 'Please check',
    duration: 6000,
    politeness: 'polite',
  },
  [ToastType.Error]: {
    icon: 'error',
    title: 'That didn’t work',
    duration: 8000,
    politeness: 'assertive',
  },
};

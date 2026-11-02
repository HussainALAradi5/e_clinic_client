/** Look and timing of a toast type. */
export interface ToastStyle {
  icon: string;
  title: string;
  duration: number;
  politeness: 'polite' | 'assertive';
}

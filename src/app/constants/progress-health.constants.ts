import { ProgressHealth } from '@enums/clinic/progress-health.enum';

/** Label and colours of each health (fill = attended sessions, ring = booked ones). */
export const PROGRESS_HEALTH: Record<
  ProgressHealth,
  { label: string; fill: string; ring: string; text: string }
> = {
  [ProgressHealth.NotStarted]: {
    label: 'Not started',
    fill: 'bg-zinc-400 dark:bg-zinc-500',
    ring: 'border-zinc-400 dark:border-zinc-500',
    text: 'text-on-surface-variant',
  },
  [ProgressHealth.OnTrack]: {
    label: 'On track',
    fill: 'bg-primary',
    ring: 'border-primary',
    text: 'text-primary',
  },
  [ProgressHealth.Slipping]: {
    label: 'Missing sessions',
    fill: 'bg-amber-500',
    ring: 'border-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
  },
  [ProgressHealth.AtRisk]: {
    label: 'At risk',
    fill: 'bg-red-600 dark:bg-red-500',
    ring: 'border-red-600 dark:border-red-500',
    text: 'text-red-700 dark:text-red-300',
  },
  [ProgressHealth.Done]: {
    label: 'Completed',
    fill: 'bg-green-600 dark:bg-green-500',
    ring: 'border-green-600 dark:border-green-500',
    text: 'text-green-700 dark:text-green-300',
  },
  [ProgressHealth.Stopped]: {
    label: 'Stopped',
    fill: 'bg-zinc-400 dark:bg-zinc-500',
    ring: 'border-zinc-400 dark:border-zinc-500',
    text: 'text-on-surface-variant',
  },
};

/** Two missed sessions in a row, or under 60 % attended, puts a plan at risk; any miss or under 85 % is slipping. */
export const AT_RISK_CONSECUTIVE_ABSENCES = 2;
export const AT_RISK_ATTENDANCE = 60;
export const SLIPPING_ATTENDANCE = 85;

import { wallClock } from '@utilities/clock-format';
import { CLINIC_TIME_ZONE } from '@constants/app.constants';
import { addDays, clinicIsoDate, clinicTime } from '@utilities/clinic-time';
import { BubbleColor } from '@enums/communication/bubble-color.enum';

/** Bubble colours the user can pick (fill + text), readable in light and dark. */
export const BUBBLE_COLORS: Record<BubbleColor, { bg: string; fg: string; label: string }> = {
  [BubbleColor.Blue]: { bg: '#2563eb', fg: '#ffffff', label: 'Blue' },
  [BubbleColor.Green]: { bg: '#15803d', fg: '#ffffff', label: 'Green' },
  [BubbleColor.Teal]: { bg: '#0f766e', fg: '#ffffff', label: 'Teal' },
  [BubbleColor.Purple]: { bg: '#7c3aed', fg: '#ffffff', label: 'Purple' },
  [BubbleColor.Rose]: { bg: '#e11d48', fg: '#ffffff', label: 'Rose' },
  [BubbleColor.Slate]: { bg: '#475569', fg: '#ffffff', label: 'Slate' },
};

/** A group leader's bubbles always stand out (amber), whatever the reader picked for others. */
export const LEADER_BUBBLE = { bg: '#d97706', fg: '#ffffff' };

const AVATAR_TINTS = ['#0b5d57', '#2563eb', '#7c3aed', '#c2410c', '#be185d', '#0f766e', '#4d7c0f'];

/** A steady colour per person for initials avatars and names in group chats. */
export function tintFor(id: string): string {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')
  ).toUpperCase();
}

export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** "14:05" today, "Mon" this week, "12 Oct" otherwise — like a phone chat list (clinic time zone). */
export function chatStamp(iso: string | null): string {
  if (!iso) return '';
  const instant = new Date(iso);
  const day = clinicIsoDate(instant);
  const today = clinicIsoDate();
  if (day === today) return wallClock(clinicTime(instant));
  if (day > addDays(today, -6)) {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: CLINIC_TIME_ZONE,
      weekday: 'short',
    }).format(instant);
  }
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIME_ZONE,
    day: 'numeric',
    month: 'short',
  }).format(instant);
}

/** Day separator in a chat: Today, Yesterday or the date (clinic time zone). */
export function dayLabel(iso: string): string {
  const instant = new Date(iso);
  const day = clinicIsoDate(instant);
  const today = clinicIsoDate();
  if (day === today) return 'Today';
  if (day === addDays(today, -1)) return 'Yesterday';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(instant);
}

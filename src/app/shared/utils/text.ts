/** 'in_progress' / 'dateOfBirth' → 'In progress' / 'Date of birth'. */
export function humanise(value: string): string {
  const text = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'];

/** 1536 → '1.5 KB'. */
export function formatBytes(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${unit === 0 ? value : value.toFixed(1)} ${BYTE_UNITS[unit]}`;
}

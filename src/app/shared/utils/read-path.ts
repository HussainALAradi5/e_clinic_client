import { toCamel } from './case';

/** Reads `patient.name` style paths (field names are snake_case in the schema, camelCase in data). */
export function readPath(row: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (value, key) => (value as Record<string, unknown> | null | undefined)?.[toCamel(key)],
      row,
    );
}

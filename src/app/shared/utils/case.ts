/** snake_case ⇄ camelCase for API payloads (keys only — values such as enum values are never touched). */

export function toCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

export function toSnake(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype
  );
}

export function convertKeys<T>(value: unknown, convert: (key: string) => string): T {
  if (Array.isArray(value)) {
    return value.map((item) => convertKeys(item, convert)) as T;
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [convert(k), convertKeys(v, convert)]),
    ) as T;
  }
  return value as T;
}

/** `filter[providerId][eq]` → `filter[provider_id][eq]`. */
export function toSnakeParam(name: string): string {
  return name.replace(/[A-Za-z0-9_]+/g, toSnake);
}

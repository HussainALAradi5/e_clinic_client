/** GET /meta/enums: options (+ transitions for state enums) per enum name. */
export interface EnumOption<V extends string | number = string | number> {
  value: V;
  label: string;
}

export interface EnumMeta {
  options: EnumOption[];
  transitions?: Record<string, (string | number)[]>;
}

export type EnumCatalog = Record<string, EnumMeta>;

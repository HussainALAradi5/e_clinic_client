/** GET /meta/enums: options (+ transitions for state enums) per enum name. */
export interface EnumOption<V extends string | number = string | number> {
  value: V;
  label: string;
}

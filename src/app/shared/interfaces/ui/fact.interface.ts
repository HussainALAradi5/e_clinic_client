/** One row of `<ui-facts>`. */
export interface Fact {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
  /** Show the value as the coloured badge of this enum (`value` is then the enum value). */
  enum?: string;
  /** Country code (ISO 3166-1 alpha-2): the value is shown as a badge with this country's flag. */
  flag?: string | null;
}

/** One row of `<ui-facts>`. */
export interface Fact {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}

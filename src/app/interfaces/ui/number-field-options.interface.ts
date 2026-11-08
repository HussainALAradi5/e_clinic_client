/** Limits of a number field. `min` is never below 0 in the app's fields. */
export interface NumberFieldOptions {
  min: number;
  max: number | null;
  step: number;
  decimals: number;
}

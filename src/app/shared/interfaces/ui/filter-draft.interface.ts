/** Editor state of one GenericFilter field. */
export interface FilterDraft {
  values: (string | number)[];
  text: string;
  min: string;
  max: string;
}

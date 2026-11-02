/** POST /<endpoint>/import — every row was saved. */
export interface ImportResult {
  resource: string;
  created: number;
  ids: string[];
}

/** One access-matrix row (GET / PUT /roles/{role}/access). */
export interface AccessRow {
  resource: string;
  module: string;
  readOwn: boolean;
  readAll: boolean;
  create: boolean;
  write: boolean;
  delete: boolean;
  /** Granted special actions (without the resource prefix). */
  actions: string[];
  availableActions: string[];
}

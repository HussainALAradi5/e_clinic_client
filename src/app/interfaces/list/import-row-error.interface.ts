/** One problem of a rejected import (`meta.rows` of IMPORT_FAILED). */
export interface ImportRowError {
  row: number;
  column: string | null;
  message: string;
}

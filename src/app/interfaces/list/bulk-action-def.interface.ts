export interface BulkActionDef {
  name: string;
  needsReason: boolean;
  inverse: string | null;
}

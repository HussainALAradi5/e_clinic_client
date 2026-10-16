/** Mirror of ScanResultData — what a scanned / verified code points to. */
export interface ScanResult {
  entity: string;
  id: string;
  code: string;
  valid: boolean;
  summary: Record<string, unknown>;
}

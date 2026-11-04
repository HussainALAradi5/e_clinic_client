import { DocumentType } from '@enums/documents/document-type.enum';

/** Mirror of ScanResultData — what a scanned / verified code points to. */
export interface ScanResult {
  entity: string;
  id: string;
  code: string;
  valid: boolean;
  summary: Record<string, unknown>;
  /** The record's PDF type (open it at documents/{document}/{id}, still checked against the reader's rights). */
  document: DocumentType | null;
}

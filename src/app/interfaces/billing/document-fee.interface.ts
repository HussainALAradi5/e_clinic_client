import { WrittenDocumentKind } from '@enums/documents/written-document-kind.enum';
import { Money } from '@interfaces/common/money.interface';

/** GET billing/document-fees: a document kind that costs money, from the price list. */
export interface DocumentFee {
  kind: WrittenDocumentKind;
  name: string;
  amount: Money;
}

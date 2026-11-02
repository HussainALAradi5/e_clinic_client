import { ListQuery } from '@interfaces/list/list-query.interface';

/** Mirror of BulkActionData: `ids` (≤ 500) or `filter` (select all matching) — never both. */
export interface BulkActionRequest {
  action: string;
  ids?: string[];
  filter?: ListQuery;
  reason?: string;
  dryRun?: boolean;
}

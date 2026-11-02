import { SavedViewQuery } from '@interfaces/view/saved-view-query.type';

/** POST /views (PUT accepts the same fields except resource / isDefault). */
export interface SavedViewPayload {
  resource?: string;
  name?: string;
  query?: SavedViewQuery;
  columns?: string[];
  isShared?: boolean;
  isDefault?: boolean;
}

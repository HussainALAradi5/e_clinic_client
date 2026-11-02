import { SavedViewQuery } from '@interfaces/view/saved-view-query.type';

/** Mirror of SavedViewResource — a saved list layout. */
export interface SavedView {
  id: string;
  resource: string;
  name: string;
  query: SavedViewQuery;
  columns: string[];
  isShared: boolean;
  isDefault: boolean;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}

import { ListQuery } from './list-query.interface';
import { ResourceSchema } from './resource-schema.interface';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { Page } from '@shared/interfaces/api/page.interface';

/** State of the component-scoped ResourceListStore. */
export interface ResourceListState {
  endpoint: string;
  schema: ResourceSchema | null;
  query: ListQuery;
  page: Page<{ id: string }>;
  loading: boolean;
  error: ApiError | null;
}

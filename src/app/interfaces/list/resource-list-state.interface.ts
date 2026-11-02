import { ListQuery } from './list-query.interface';
import { ResourceSchema } from './resource-schema.interface';
import { ApiError } from '@interfaces/api/api-error.interface';
import { Page } from '@interfaces/api/page.interface';

/** State of the component-scoped ResourceListStore. */
export interface ResourceListState {
  endpoint: string;
  /** Fixed endpoint parameters every request carries, e.g. `{ role: 'doctor' }` for a role's members. */
  params: Record<string, string>;
  schema: ResourceSchema | null;
  query: ListQuery;
  page: Page<{ id: string }>;
  loading: boolean;
  error: ApiError | null;
}

import { PageMeta } from '@interfaces/api/page-meta.interface';

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

import { SortDirection } from '@shared/enums/shared/sort-direction.enum';

/** List meta from ApiResponse::paginated(): page info or cursors + echoed sort / filters / date. */
export interface PageMeta {
  currentPage?: number;
  perPage: number;
  total?: number;
  lastPage?: number;
  nextCursor?: string | null;
  prevCursor?: string | null;
  sort?: { field: string; dir: SortDirection }[];
  filters?: Record<string, unknown> | null;
  date?: { field: string; from: string | null; to: string | null; preset: string | null } | null;
  /** GET /notifications/mine: unread in-app notifications (bell badge). */
  unreadCount?: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

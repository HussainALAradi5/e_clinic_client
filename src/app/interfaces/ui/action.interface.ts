import { Observable } from 'rxjs';

/** What an AppButton / GenericForm action may return. */
export type ActionResult = Observable<unknown> | Promise<unknown> | unknown;

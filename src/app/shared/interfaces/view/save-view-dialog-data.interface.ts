import { SavedView, SavedViewPayload } from './saved-view.interface';

/** SaveViewDialog: name / share / default of a new view; closes with the saved view. */
export interface SaveViewDialogData {
  /** The caller may share views (holds `<resource>.read_all`). */
  canShare: boolean;
  save: (payload: Pick<SavedViewPayload, 'name' | 'isShared' | 'isDefault'>) => Promise<SavedView>;
}

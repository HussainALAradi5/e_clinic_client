import { DATE_TIME_FORMAT } from '@constants/app.constants';

/** Entries always on show; the rest sit inside the collapse. */
export const ACTIVITY_LOG_VISIBLE_ENTRIES = 3;

/** To the second: an event log says exactly when. */
export const ACTIVITY_LOG_DATE_FORMAT = `:ss`;

/** Text of common/activity-log/activity-log.component (sentence parts, labels, empty state). */
export const ACTIVITY_LOG_TEXT = {
  title: 'Event log',
  system: 'System',
  separator: '·',
  from: 'from',
  to: 'to',
  setTo: 'set to',
  cleared: 'cleared',
  was: 'was',
  changeSeparator: '; ',
  noActivityYet: 'No activity yet',
  loadMore: 'Load more',
  loading: 'Loading…',
  moreEntry: 'more entry',
  moreEntries: 'more entries',
};

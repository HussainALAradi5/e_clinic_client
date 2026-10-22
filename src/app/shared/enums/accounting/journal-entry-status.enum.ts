/** Mirror of App\Enums\Accounting\JournalEntryStatus — posted entries never change; they are reversed. */
export enum JournalEntryStatus {
  Draft = 'draft',
  Posted = 'posted',
  Reversed = 'reversed',
}

/** Mirror of App\Enums\Accounting\JournalEntryType — people write manual / adjustment entries; the rest are posted for them. */
export enum JournalEntryType {
  Manual = 'manual',
  Automatic = 'automatic',
  Adjustment = 'adjustment',
  Reversal = 'reversal',
  Opening = 'opening',
  Closing = 'closing',
}

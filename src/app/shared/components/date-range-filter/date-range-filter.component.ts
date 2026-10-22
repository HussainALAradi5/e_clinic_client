import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DateRangeHeader, DateRangeHost } from './date-range-header.component';
import {
  DateFieldOption,
  DateRangeValue,
} from '@shared/interfaces/list/date-range-filter.interface';
import { dateRangeFor } from '@shared/utils/clinic-time';

/**
 * One date filter for a list: a single field that opens one compact calendar — pick the first and the last day; lists
 * with several dates choose which one at the top. A rolling period from a saved view shows as its dates.
 * Emits only when something changed; the clear button returns to "any time".
 */
@Component({
  selector: 'ui-date-range-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [{ provide: DateRangeHost, useExisting: DateRangeFilter }],
  host: { class: 'block' },
  templateUrl: './date-range-filter.component.html',
})
export class DateRangeFilter implements DateRangeHost {
  readonly fields = input.required<DateFieldOption[]>();
  readonly value = input<DateRangeValue>({});
  readonly valueChange = output<DateRangeValue>();

  protected readonly header = DateRangeHeader;
  private readonly picker = viewChild.required<MatDateRangePicker<string>>('picker');
  /** Days picked on the calendar or typed, before they are applied. */
  private readonly draft = signal<{ from?: string | null; to?: string | null } | null>(null);

  readonly current = computed<DateRangeValue>(() => ({
    ...this.value(),
    field: this.value().field ?? this.fields()[0]?.value,
  }));
  protected readonly range = computed(() => {
    const { preset, from, to } = this.current();
    const resolved = preset ? dateRangeFor(preset) : null;
    return { from: resolved?.[0] ?? from ?? null, to: resolved?.[1] ?? to ?? null };
  });
  protected readonly label = computed(
    () => this.fields().find((f) => f.value === this.current().field)?.label ?? 'Date',
  );
  protected readonly active = computed(
    () => !!(this.current().preset || this.current().from || this.current().to),
  );

  chooseField(field: string): void {
    this.emit({ ...this.current(), field });
  }

  protected picked(edge: 'from' | 'to', day: string | null): void {
    this.draft.update((d) => ({ ...(d ?? this.range()), [edge]: day }));
    // Typed into the field (calendar closed): apply at once; picked on the calendar: apply when it closes.
    if (!this.picker().opened) this.applyDraft();
  }

  protected applyDraft(): void {
    const draft = this.draft();
    this.draft.set(null);
    if (!draft) return;
    const { from, to } = { ...this.range(), ...draft };
    if (from === this.range().from && to === this.range().to && !this.current().preset) return;
    this.emit({ field: this.current().field, from: from ?? undefined, to: to ?? undefined });
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.draft.set(null);
    this.emit({ field: this.current().field });
  }

  private emit(value: DateRangeValue): void {
    this.valueChange.emit(value);
  }
}

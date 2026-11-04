import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, firstValueFrom, Subject } from 'rxjs';
import { CONTACT_SEARCH } from '@constants/communication/contact-search.constants';
import { ChatContact } from '@interfaces/communication/chat.interface';
import { ChatApi } from '@services/communication/chat-api.service';

/**
 * Finding colleagues to message (provide it in the dialog): search by name, phone, email or staff no. on the server,
 * one page at a time, with "Show more". Only people in the system appear. `exclude` hides some (e.g. current members).
 */
@Injectable()
export class ContactSearchStore {
  private readonly api = inject(ChatApi);
  private readonly typed = new Subject<string>();
  private query = '';
  private page = 1;
  private lastPage = 1;

  readonly items = signal<ChatContact[]>([]);
  readonly loading = signal(false);
  readonly total = signal(0);
  readonly exclude = signal<ReadonlySet<string>>(new Set());
  readonly shown = computed(() => this.items().filter((c) => !this.exclude().has(c.id)));
  readonly hasMore = computed(() => this.page < this.lastPage);

  constructor() {
    this.typed
      .pipe(
        debounceTime(CONTACT_SEARCH.debounceMs),
        distinctUntilChanged(),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((q) => void this.load(q, 1));
  }

  /** As the user types (debounced). */
  search(text: string): void {
    this.typed.next(text.trim());
  }

  /** First page with no search. */
  start(): Promise<void> {
    return this.load('', 1);
  }

  more(): Promise<void> {
    return this.hasMore() ? this.load(this.query, this.page + 1) : Promise.resolve();
  }

  /** Drops one contact from the list (e.g. just added to the group). */
  remove(id: string): void {
    this.items.update((list) => list.filter((c) => c.id !== id));
  }

  private async load(query: string, page: number): Promise<void> {
    this.loading.set(true);
    try {
      const result = await firstValueFrom(this.api.contacts(query, page, CONTACT_SEARCH.pageSize));
      if (query !== this.query && page > 1) return; // a newer search started meanwhile
      this.query = query;
      this.page = result.meta.currentPage ?? page;
      this.lastPage = result.meta.lastPage ?? page;
      this.total.set(result.meta.total ?? result.data.length);
      this.items.update((list) => (page === 1 ? result.data : [...list, ...result.data]));
    } finally {
      this.loading.set(false);
    }
  }
}

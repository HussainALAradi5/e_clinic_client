import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { ActivityLog } from '@components/common/activity-log/activity-log.component';
import { AuditAction } from '@enums/identity/audit-action.enum';
import { Page } from '@interfaces/api/page.interface';
import { ActivityEntry } from '@interfaces/identity/activity-entry.interface';
import { ActivityRequest } from '@interfaces/identity/activity-request.interface';
import { ActivityApi } from '@services/identity/activity-api.service';

function entry(day: number, overrides: Partial<ActivityEntry> = {}): ActivityEntry {
  return {
    id: `entry-${day}`,
    action: AuditAction.Viewed,
    actionLabel: 'Opened the page',
    entity: 'invoice',
    changes: [],
    changedBy: `Person ${day}`,
    createdAt: `2026-11-${String(day).padStart(2, '0')}T18:27:00`,
    ...overrides,
  };
}

function page(data: ActivityEntry[], nextCursor: string | null = null): Page<ActivityEntry> {
  return { data, meta: { perPage: 25, nextCursor } };
}

async function setup(
  respond: (request: ActivityRequest) => Observable<Page<ActivityEntry>>,
): Promise<ComponentFixture<ActivityLog>> {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ActivityApi, useValue: { forRecord: respond } },
    ],
  });
  const fixture = TestBed.createComponent(ActivityLog);
  fixture.componentRef.setInput('entity', 'invoice');
  fixture.componentRef.setInput('recordId', 'record-1');
  await fixture.whenStable();
  return fixture;
}

function days(count: number): ActivityEntry[] {
  return Array.from({ length: count }, (_, i) => entry(count - i));
}

function html(fixture: ComponentFixture<ActivityLog>): HTMLElement {
  return fixture.nativeElement;
}

function shownEntries(fixture: ComponentFixture<ActivityLog>): number {
  return html(fixture).querySelectorAll(':scope > app-activity-entries li').length;
}

function collapsedEntries(fixture: ComponentFixture<ActivityLog>): number {
  return html(fixture).querySelectorAll('ui-collapse li').length;
}

function text(fixture: ComponentFixture<ActivityLog>): string {
  return (html(fixture).textContent ?? '').replace(/\s+/g, ' ');
}

function loadMoreButton(fixture: ComponentFixture<ActivityLog>): HTMLButtonElement | null {
  return html(fixture).querySelector(':scope > button');
}

describe('ActivityLog', () => {
  it('shows every entry when there are three or fewer, with no collapse', async () => {
    const fixture = await setup(() => of(page(days(3))));
    expect(shownEntries(fixture)).toBe(3);
    expect(html(fixture).querySelector('ui-collapse')).toBeNull();
  });

  it('keeps the first three on show and puts the rest in the collapse', async () => {
    const fixture = await setup(() => of(page(days(5))));
    expect(shownEntries(fixture)).toBe(3);
    expect(collapsedEntries(fixture)).toBe(2);
    expect(html(fixture).querySelector('ui-collapse button')?.textContent).toContain(
      '2 more entries',
    );
  });

  it('counts a single extra entry in the singular', async () => {
    const fixture = await setup(() => of(page(days(4))));
    expect(html(fixture).querySelector('ui-collapse button')?.textContent).toContain(
      '1 more entry',
    );
  });

  it('writes each entry as one sentence with only the action as a badge', async () => {
    const edited = entry(2, {
      action: AuditAction.Updated,
      changedBy: 'Rana Saleh',
      changes: [{ field: 'email', label: 'Email', old: 'a@x.com', new: 'b@x.com' }],
    });
    const fixture = await setup(() => of(page([edited])));
    expect(text(fixture)).toContain('Rana Saleh');
    expect(text(fixture)).toContain('Email from a@x.com to b@x.com · 02 Nov 2026, 18:27:');
    expect(html(fixture).querySelectorAll('ui-status').length).toBe(1);
  });

  it('names the system when nobody made the change', async () => {
    const fixture = await setup(() => of(page([entry(1, { changedBy: null })])));
    expect(text(fixture)).toContain('System');
  });

  it('puts the newest entry first', async () => {
    const fixture = await setup(() => of(page([entry(1), entry(3), entry(2)])));
    expect(html(fixture).querySelector('li')?.textContent).toContain('Person 3');
  });

  it('appends the next page and opens the collapse', async () => {
    const fixture = await setup((request) =>
      request.cursor === 'next' ? of(page([entry(1)])) : of(page(days(5).slice(0, 4), 'next')),
    );
    loadMoreButton(fixture)?.click();
    await fixture.whenStable();
    expect(collapsedEntries(fixture)).toBe(2);
    expect(html(fixture).querySelector('ui-collapse button')?.getAttribute('aria-expanded')).toBe(
      'true',
    );
    expect(loadMoreButton(fixture)).toBeNull();
  });

  it('shows the empty state', async () => {
    const fixture = await setup(() => of(page([])));
    expect(html(fixture).querySelector('ui-empty')).not.toBeNull();
  });

  it('shows the error state and retries', async () => {
    let calls = 0;
    const fixture = await setup(() =>
      ++calls === 1 ? throwError(() => new Error('down')) : of(page(days(1))),
    );
    html(fixture).querySelector<HTMLButtonElement>('ui-error button')?.click();
    await fixture.whenStable();
    expect(html(fixture).querySelector('ui-error')).toBeNull();
    expect(shownEntries(fixture)).toBe(1);
  });

  it('has no edit or delete controls', async () => {
    const fixture = await setup(() => of(page(days(3))));
    expect(html(fixture).querySelectorAll('button').length).toBe(0);
  });
});

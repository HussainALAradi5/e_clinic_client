import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { RouteLoadingService } from './route-loading.service';

describe('RouteLoadingService', () => {
  const events = new Subject<unknown>();
  let service: RouteLoadingService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const router = TestBed.inject(Router);
    Object.defineProperty(router, 'events', { value: events });
    service = TestBed.inject(RouteLoadingService);
  });

  afterEach(() => vi.useRealTimers());

  it('stays hidden for fast navigations', () => {
    events.next(new NavigationStart(1, '/a'));
    vi.advanceTimersByTime(150);
    events.next(new NavigationEnd(1, '/a', '/a'));
    vi.advanceTimersByTime(1000);
    expect(service.active()).toBe(false);
  });

  it('shows for slow navigations and stays long enough not to flicker', () => {
    events.next(new NavigationStart(1, '/a'));
    vi.advanceTimersByTime(250);
    expect(service.active()).toBe(true);

    events.next(new NavigationEnd(1, '/a', '/a'));
    vi.advanceTimersByTime(100);
    expect(service.active()).toBe(true);
    vi.advanceTimersByTime(400);
    expect(service.active()).toBe(false);
  });
});

import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { DashboardSection } from '@enums/dashboard/dashboard-section.enum';
import { DashboardData } from '@interfaces/dashboard/dashboard-data.interface';
import { Dashboard } from '@interfaces/dashboard/dashboard.interface';
import { DashboardApi } from '@services/dashboard/dashboard-api.service';
import { DashboardStore } from './dashboard.store';

const DATA: DashboardData = { dashboardId: 'd-1', date: '2026-11-08', widgets: [] };
const DASHBOARD = { id: 'd-1' } as Dashboard;

describe('DashboardStore', () => {
  const api = { findDefault: vi.fn(), data: vi.fn() };
  let store: DashboardStore;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [DashboardStore, { provide: DashboardApi, useValue: api }],
    });
    store = TestBed.inject(DashboardStore);
  });

  it('loads the default dashboard and its figures', () => {
    api.findDefault.mockReturnValue(of(DASHBOARD));
    api.data.mockReturnValue(of(DATA));

    store.load(DashboardSection.Attendance);

    expect(api.data).toHaveBeenCalledWith('d-1');
    expect(store.data()).toEqual(DATA);
    expect(store.loading()).toBe(false);
  });

  it('is empty without a default dashboard', () => {
    api.findDefault.mockReturnValue(of(null));

    store.load(DashboardSection.Attendance);

    expect(api.data).not.toHaveBeenCalled();
    expect(store.isEmpty()).toBe(true);
  });

  it('keeps the error for the retry state', () => {
    const failure = new Error('down');
    api.findDefault.mockReturnValue(throwError(() => failure));

    store.load(DashboardSection.Attendance);

    expect(store.error()).toBe(failure);
    expect(store.isEmpty()).toBe(false);
    expect(store.loading()).toBe(false);
  });

  it('ignores a slower earlier load', () => {
    const first = new Subject<Dashboard>();
    api.findDefault.mockReturnValueOnce(first).mockReturnValueOnce(of(null));

    store.load(DashboardSection.Attendance);
    store.load(DashboardSection.Attendance);
    first.next(DASHBOARD);

    expect(api.data).not.toHaveBeenCalled();
    expect(store.data()).toBeNull();
  });
});

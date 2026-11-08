import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DashboardSection } from '@enums/dashboard/dashboard-section.enum';
import { DashboardApi } from './dashboard-api.service';

describe('DashboardApi', () => {
  let api: DashboardApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(DashboardApi);
    http = TestBed.inject(HttpTestingController);
  });

  it("asks for the section's default", async () => {
    const found = firstValueFrom(api.findDefault(DashboardSection.Attendance));
    const req = http.expectOne((r) => r.url === 'dashboards');
    expect(req.request.params.get('filter[and][0][section][eq]')).toBe('attendance');
    expect(req.request.params.get('filter[and][1][is_default][eq]')).toBe('true');
    expect(req.request.params.get('per_page')).toBe('1');
    req.flush({ data: [{ id: 'd-1' }], meta: { perPage: 1 } });
    expect((await found)?.id).toBe('d-1');
  });

  it('answers null when the section has no default', async () => {
    const found = firstValueFrom(api.findDefault(DashboardSection.Attendance));
    http.expectOne((r) => r.url === 'dashboards').flush({ data: [], meta: { perPage: 1 } });
    expect(await found).toBeNull();
  });

  it("reads a dashboard's figures", async () => {
    const data = firstValueFrom(api.data('d-1'));
    http
      .expectOne('dashboards/d-1/data')
      .flush({ data: { dashboardId: 'd-1', date: '2026-11-08', widgets: [] } });
    expect((await data).date).toBe('2026-11-08');
  });
});

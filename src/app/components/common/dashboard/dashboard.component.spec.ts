import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DashboardMetricKind } from '@enums/dashboard/dashboard-metric-kind.enum';
import { DashboardSection } from '@enums/dashboard/dashboard-section.enum';
import { DashboardWidgetSize } from '@enums/dashboard/dashboard-widget-size.enum';
import { DashboardComponent } from './dashboard.component';

const STAT = {
  metric: 'late',
  title: 'Late',
  kind: DashboardMetricKind.Stat,
  size: DashboardWidgetSize.Small,
  position: 0,
  value: 3,
  items: null,
};
const LIST = {
  metric: 'late_arrivals',
  title: 'Late arrivals',
  kind: DashboardMetricKind.List,
  size: DashboardWidgetSize.Large,
  position: 1,
  value: null,
  items: [{ id: 'a-1', title: 'Sara Ali', subtitle: 'Outpatients', value: '20 min late' }],
};

describe('DashboardComponent', () => {
  let http: HttpTestingController;

  const render = async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.componentRef.setInput('section', DashboardSection.Attendance);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  };
  const defaultRequest = () => http.expectOne((r) => r.url === 'dashboards');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  it('shows placeholders, then stat and list widgets', async () => {
    const fixture = await render();
    expect(fixture.nativeElement.querySelector('ui-skeleton')).not.toBeNull();

    defaultRequest().flush({ data: [{ id: 'd-1' }], meta: { perPage: 1 } });
    http
      .expectOne('dashboards/d-1/data')
      .flush({ data: { dashboardId: 'd-1', date: '2026-11-08', widgets: [STAT, LIST] } });
    await fixture.whenStable();

    const widgets = fixture.nativeElement.querySelectorAll('ui-dashboard-widget');
    expect(widgets.length).toBe(2);
    expect(widgets[0].textContent).toContain('3');
    expect(widgets[0].getAttribute('data-size')).toBe('small');
    expect(widgets[1].textContent).toContain('Sara Ali');
    expect(widgets[1].textContent).toContain('20 min late');
  });

  it('shows the empty state when the user gets no widgets', async () => {
    const fixture = await render();
    defaultRequest().flush({ data: [], meta: { perPage: 1 } });
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('ui-empty')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('ui-dashboard-widget')).toBeNull();
  });

  it('shows the error state and retries', async () => {
    const fixture = await render();
    defaultRequest().flush({}, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('ui-error')).not.toBeNull();

    fixture.nativeElement.querySelector('ui-error button').click();
    defaultRequest().flush({ data: [], meta: { perPage: 1 } });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('ui-empty')).not.toBeNull();
  });
});

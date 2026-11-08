import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivityLog } from '@components/common/activity-log/activity-log.component';
import { AccessService } from '@services/auth/access.service';
import { activityLogRoute } from '@utilities/activity-log';
import { PageActivity } from './page-activity.component';

@Component({ selector: 'app-activity-log', template: '{{ entity() }}:{{ recordId() }}' })
class ActivityLogStub {
  readonly entity = input.required<string>();
  readonly recordId = input.required<string>();
}

@Component({ template: '' })
class Blank {}

describe('PageActivity', () => {
  async function open(url: string, rights: string[]): Promise<string> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'appointments/:id',
            component: Blank,
            data: activityLogRoute('appointment', 'appointments.read_all'),
          },
          { path: 'other/:id', component: Blank },
        ]),
        { provide: AccessService, useValue: { can: (right: string) => rights.includes(right) } },
      ],
    });
    TestBed.overrideComponent(PageActivity, {
      remove: { imports: [ActivityLog] },
      add: { imports: [ActivityLogStub] },
    });
    await TestBed.inject(Router).navigateByUrl(url);
    const fixture = TestBed.createComponent(PageActivity);
    fixture.detectChanges();
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('shows the log of the record the page opened, to those the route allows', async () => {
    expect(await open('/appointments/a1', ['appointments.read_all'])).toContain('appointment:a1');
  });

  it('stays out of sight without that page right', async () => {
    expect(await open('/appointments/a1', ['activity.read_all'])).toBe('');
  });

  it('adds nothing on a route that did not opt in', async () => {
    expect(await open('/other/a1', ['appointments.read_all'])).toBe('');
  });
});

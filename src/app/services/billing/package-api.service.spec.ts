import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { PackageApi } from './package-api.service';

describe('PackageApi', () => {
  let api: PackageApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(PackageApi);
    http = TestBed.inject(HttpTestingController);
  });

  it('sells a package to the patient with an idempotency key', async () => {
    const sold = firstValueFrom(api.sell('p-1', 'k-1', 'key-1'));
    const req = http.expectOne('billing/patients/p-1/packages');
    expect(req.request.body).toEqual({ packageId: 'k-1' });
    req.flush({ data: { id: 'pp-1', status: 'awaiting_payment' } });
    expect((await sold).status).toBe('awaiting_payment');
  });

  it("lists the patient's packages", async () => {
    const list = firstValueFrom(api.ofPatient('p-1'));
    http
      .expectOne((r) => r.url === 'billing/patient-packages')
      .flush({ data: [{ id: 'pp-1', sessionsLeft: 2 }], meta: { perPage: 20 } });
    expect((await list)[0].sessionsLeft).toBe(2);
  });
});

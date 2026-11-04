import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CommissionType } from '@enums/hr/commission-type.enum';
import { DoctorEarningApi } from './doctor-earning-api.service';

describe('DoctorEarningApi', () => {
  let api: DoctorEarningApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(DoctorEarningApi);
    http = TestBed.inject(HttpTestingController);
  });

  it('asks for one month', async () => {
    const rows = firstValueFrom(api.month(2026, 11));
    const req = http.expectOne((r) => r.url === 'hr/doctor-earnings');
    expect(req.request.params.get('year')).toBe('2026');
    expect(req.request.params.get('month')).toBe('11');
    req.flush({ data: [{ doctor: { id: 'd-1' }, commission: { amount: '6.000' } }] });
    expect((await rows)[0].commission.amount).toBe('6.000');
  });

  it("sets a doctor's terms", async () => {
    const done = firstValueFrom(api.setCommission('d-1', CommissionType.Percent, '20'));
    const req = http.expectOne('hr/doctors/d-1/commission');
    expect(req.request.body).toEqual({ commissionType: 'percent', commissionValue: '20' });
    req.flush({ data: {} });
    await done;
  });
});

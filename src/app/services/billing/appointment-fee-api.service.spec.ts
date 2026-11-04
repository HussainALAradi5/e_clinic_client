import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AppointmentFeeApi } from './appointment-fee-api.service';

describe('AppointmentFeeApi', () => {
  let api: AppointmentFeeApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(AppointmentFeeApi);
    http = TestBed.inject(HttpTestingController);
  });

  it('reads the cancellation fee, null when cancelling is free', async () => {
    const charged = firstValueFrom(api.cancellationFee('a-1'));
    http
      .expectOne('billing/appointments/a-1/cancellation-fee')
      .flush({ data: { amount: { amount: '3.000', currency: 'BHD' } } });
    expect((await charged)?.amount).toBe('3.000');

    const free = firstValueFrom(api.cancellationFee('a-2'));
    http.expectOne('billing/appointments/a-2/cancellation-fee').flush({ data: { amount: null } });
    expect(await free).toBeNull();
  });

  it('lists the documents that cost money', async () => {
    const fees = firstValueFrom(api.documentFees());
    http.expectOne('billing/document-fees').flush({
      data: [
        {
          kind: 'medical_report',
          name: 'Medical report',
          amount: { amount: '10.000', currency: 'BHD' },
        },
      ],
    });
    expect((await fees)[0].amount.amount).toBe('10.000');
  });

  it('waives with the reason', async () => {
    const done = firstValueFrom(api.waive('f-1', 'Family emergency'));
    const req = http.expectOne('billing/appointment-fees/f-1/waive');
    expect(req.request.body).toEqual({ reason: 'Family emergency' });
    req.flush({ data: { id: 'f-1', status: 'waived' } });
    expect((await done).status).toBe('waived');
  });
});

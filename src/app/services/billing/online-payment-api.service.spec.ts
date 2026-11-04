import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { OnlinePaymentApi } from './online-payment-api.service';

describe('OnlinePaymentApi', () => {
  let api: OnlinePaymentApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(OnlinePaymentApi);
    http = TestBed.inject(HttpTestingController);
  });

  it('starts a payment for the invoice and returns the checkout page', async () => {
    const started = firstValueFrom(api.start('i-1', 'k-1'));
    const req = http.expectOne('billing/invoices/i-1/online-payments');
    expect(req.request.method).toBe('POST');
    req.flush({ data: { id: 'o-1', status: 'initiated', checkoutUrl: 'https://pay.example/x' } });
    expect((await started).checkoutUrl).toBe('https://pay.example/x');
  });

  it('reads an attempt as it stands', async () => {
    const online = firstValueFrom(api.get('o-1'));
    http
      .expectOne('billing/online-payments/o-1')
      .flush({ data: { id: 'o-1', status: 'captured' } });
    expect((await online).status).toBe('captured');
  });
});

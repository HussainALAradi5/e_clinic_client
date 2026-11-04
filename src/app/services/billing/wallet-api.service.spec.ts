import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { WalletMovement } from '@enums/billing/wallet-movement.enum';
import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { WalletApi } from './wallet-api.service';

describe('WalletApi', () => {
  let api: WalletApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(WalletApi);
    http = TestBed.inject(HttpTestingController);
  });

  it('reads the balance from the list meta, zero when it is missing', async () => {
    const wallet = firstValueFrom(api.get('p-1'));
    http
      .expectOne((r) => r.url === 'billing/patients/p-1/wallet')
      .flush({ data: [], meta: { perPage: 20, balance: { amount: '12.500', currency: 'BHD' } } });
    expect((await wallet).balance.amount).toBe('12.500');

    const empty = firstValueFrom(api.get('p-2'));
    http.expectOne((r) => r.url === 'billing/patients/p-2/wallet').flush({ data: [] });
    expect((await empty).balance.amount).toBe('0.000');
  });

  it('posts each movement to its own path with the idempotency key', async () => {
    const paths = {
      [WalletMovement.Deposit]: 'deposits',
      [WalletMovement.Payback]: 'withdrawals',
      [WalletMovement.Adjust]: 'adjustments',
    };
    for (const [movement, path] of Object.entries(paths)) {
      const done = firstValueFrom(
        api.move(
          'p-1',
          movement as WalletMovement,
          { amount: '5.000', method: PaymentMethod.Card },
          'k-1',
        ),
      );
      http.expectOne(`billing/patients/p-1/wallet/${path}`).flush({ data: { id: 'e-1' } });
      expect((await done).id).toBe('e-1');
    }
  });

  it('pays an invoice from the balance, sending the amount only when given', async () => {
    const all = firstValueFrom(api.payInvoice('i-1', null, 'k-2'));
    const req = http.expectOne('billing/invoices/i-1/pay-from-balance');
    expect(req.request.body).toEqual({});
    req.flush({ data: { id: 'pay-1' } });
    expect((await all).id).toBe('pay-1');
  });
});

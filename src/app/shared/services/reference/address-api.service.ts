import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Address } from '@shared/interfaces/reference/address.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/** Reference › Addresses — read and print an address (readable when its owner record is). */
@Injectable({ providedIn: 'root' })
export class AddressApi {
  private readonly api = inject(ApiClient);

  get(id: string): Observable<Address> {
    return this.api.get<Address>(`reference/addresses/${id}`);
  }

  formatted(id: string, locale: 'en' | 'ar' = 'en', multiline = false): Observable<string> {
    return this.api
      .get<{ text: string }>(`reference/addresses/${id}/formatted`, {
        params: { locale, multiline: multiline ? 1 : 0 },
      })
      .pipe(map((res) => res.text));
  }
}

import { AddressPayload } from '@interfaces/reference/address-payload.interface';

/** Mirror of AddressResource. */
export interface Address extends AddressPayload {
  id: string;
  /** Printable one-line address in the request language. */
  formatted?: string;
}

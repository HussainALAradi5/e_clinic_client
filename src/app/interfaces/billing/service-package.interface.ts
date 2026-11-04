import { Money } from '@interfaces/common/money.interface';

/** ServicePackageResource: a package in the catalog. */
export interface ServicePackage {
  id: string;
  code: string;
  name: string;
  description: string | null;
  coveredService: { id: string; code: string; name: string; price: Money };
  sessions: number;
  price: Money;
  validityDays: number;
  isActive: boolean;
}

/** POST / PUT billing/packages. */
export interface ServicePackagePayload {
  name: string;
  description: string | null;
  coveredServiceId: string;
  sessions: number;
  price: string;
  validityDays: number;
  isActive: boolean;
}

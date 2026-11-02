import { ApiError } from '@interfaces/api/api-error.interface';
import { Company } from '@interfaces/reference/company.interface';

/** CompanyStore state. */
export interface CompanyState {
  company: Company | null;
  loading: boolean;
  error: ApiError | null;
}

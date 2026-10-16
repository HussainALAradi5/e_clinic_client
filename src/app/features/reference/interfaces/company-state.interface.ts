import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { Company } from '@shared/interfaces/reference/company.interface';

/** CompanyStore state. */
export interface CompanyState {
  company: Company | null;
  loading: boolean;
  error: ApiError | null;
}

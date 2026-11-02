import { ApiError } from '@interfaces/api/api-error.interface';
import { Money } from '@interfaces/common/money.interface';

export function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'code' in value && 'status' in value;
}

export function isMoney(value: unknown): value is Money {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Money).amount === 'string' &&
    typeof (value as Money).currency === 'string'
  );
}

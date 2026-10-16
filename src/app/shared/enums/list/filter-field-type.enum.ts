import { Money } from '@shared/interfaces/common/money.interface';

/** Filter editor type from the resource schema (FilterField::TYPES). */
export enum FilterFieldType {
  Text = 'text',
  Number = 'number',
  Money = 'money',
  Date = 'date',
  Datetime = 'datetime',
  Boolean = 'boolean',
  Enum = 'enum',
  Relation = 'relation',
}

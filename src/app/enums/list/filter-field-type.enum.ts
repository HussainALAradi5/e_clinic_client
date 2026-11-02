import { Money } from '@interfaces/common/money.interface';

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
  /** A fixed list of named values sent with the schema (country, language, file type …). */
  Choice = 'choice',
}

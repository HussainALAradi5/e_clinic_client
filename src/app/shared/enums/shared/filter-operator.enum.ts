/** Mirror of FilterOperator (filter[field][op]=value). */
export enum FilterOperator {
  Eq = 'eq',
  Ne = 'ne',
  Gt = 'gt',
  Gte = 'gte',
  Lt = 'lt',
  Lte = 'lte',
  In = 'in',
  Nin = 'nin',
  Between = 'between',
  Like = 'like',
  Starts = 'starts',
  Null = 'null',
}

/** Operators whose value is a list (FilterOperator::expectsList()). */
export const LIST_OPERATORS: readonly FilterOperator[] = [
  FilterOperator.In,
  FilterOperator.Nin,
  FilterOperator.Between,
];

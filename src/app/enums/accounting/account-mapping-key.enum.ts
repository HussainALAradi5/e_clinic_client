/** Mirror of App\Enums\Accounting\AccountMappingKey — logical accounts of automatic postings. */
export enum AccountMappingKey {
  CashOnHand = 'cash_on_hand',
  Bank = 'bank',
  CardClearing = 'card_clearing',
  AccountsReceivable = 'accounts_receivable',
  InsuranceReceivable = 'insurance_receivable',
  InputVat = 'input_vat',
  VatPayable = 'vat_payable',
  SalariesPayable = 'salaries_payable',
  SocialInsurancePayable = 'social_insurance_payable',
  SalariesExpense = 'salaries_expense',
  SalesReturns = 'sales_returns',
  CashOverShort = 'cash_over_short',
  RetainedEarnings = 'retained_earnings',
  PharmacyInventory = 'pharmacy_inventory',
  CostOfGoodsSold = 'cost_of_goods_sold',
}

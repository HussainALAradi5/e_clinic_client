/** List endpoint to pick a record from, per permission resource of a relation filter (`filterable(..., resource:)`). */
export const RELATION_ENDPOINTS: Readonly<Record<string, string>> = {
  accounts: 'accounting/accounts',
  companies: 'reference/companies',
  departments: 'hr/departments',
  doctors: 'doctors',
  employees: 'hr/employees',
  medications: 'pharmacy/medications',
  patients: 'patients',
  people: 'people',
  rooms: 'rooms',
  specialties: 'doctors/specialties',
  users: 'users',
};

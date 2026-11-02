/** Mirror of App\Enums\Identity\UserType — Login account subtype (users.user_type). Rights come from roles only. */
export enum UserType {
  Admin = 'admin',
  Doctor = 'doctor',
  MedicalStaff = 'medical_staff',
  Pharmacist = 'pharmacist',
  Receptionist = 'receptionist',
  Accountant = 'accountant',
  Cashier = 'cashier',
  Hr = 'hr',
  Patient = 'patient',
}

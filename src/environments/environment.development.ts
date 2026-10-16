import { DemoLogins } from '@shared/interfaces/auth/demo-account.interface';

/** Seeded test accounts shown on the sign-in page (server DemoSeeder; see DEMO_USERS.md). Development only. */
const demoLogins: DemoLogins = {
  password: 'Demo-Pass-2026!',
  recoveryCode: 'demo1-11111',
  accounts: [
    {
      role: 'Admin',
      name: 'Amal Haddad',
      email: 'admin@demo.eclinic.bh',
      icon: 'admin_panel_settings',
      twoFactor: true,
    },
    {
      role: 'Receptionist',
      name: 'Rana Saleh',
      email: 'reception@demo.eclinic.bh',
      icon: 'support_agent',
    },
    {
      role: 'Doctor',
      name: 'Dr. Omar Khalil',
      email: 'doctor@demo.eclinic.bh',
      icon: 'stethoscope',
    },
    {
      role: 'Doctor',
      name: 'Dr. Sara Nasser',
      email: 'doctor2@demo.eclinic.bh',
      icon: 'stethoscope',
    },
    { role: 'Nurse', name: 'Maria Santos', email: 'nurse@demo.eclinic.bh', icon: 'vaccines' },
    {
      role: 'Pharmacist',
      name: 'Yusuf Ibrahim',
      email: 'pharmacist@demo.eclinic.bh',
      icon: 'medication',
    },
    {
      role: 'HR manager',
      name: 'Layla Mansour',
      email: 'hr@demo.eclinic.bh',
      icon: 'badge',
      twoFactor: true,
    },
    {
      role: 'Accountant',
      name: 'Hassan Ali',
      email: 'accountant@demo.eclinic.bh',
      icon: 'calculate',
      twoFactor: true,
    },
    {
      role: 'Cashier',
      name: 'Fatima Jaber',
      email: 'cashier@demo.eclinic.bh',
      icon: 'point_of_sale',
    },
    { role: 'Patient', name: 'Ahmed Yousif', email: 'patient@demo.eclinic.bh', icon: 'person' },
    {
      role: 'Locked account',
      name: 'Khalid Locked',
      email: 'locked@demo.eclinic.bh',
      icon: 'lock',
      refused: true,
    },
    {
      role: 'Inactive account',
      name: 'Noor Inactive',
      email: 'inactive@demo.eclinic.bh',
      icon: 'person_off',
      refused: true,
    },
  ],
};

export const environment = {
  production: false,
  demoLogins: demoLogins as DemoLogins | null,
  apiUrl: 'http://localhost:8000',
};

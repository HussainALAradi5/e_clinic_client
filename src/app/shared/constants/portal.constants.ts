import { AUTHENTICATED, PORTAL_PATH } from './app.constants';
import { NavItem } from '@shared/interfaces/ui/nav.interface';

/** Portal tabs: the bottom bar on phones, the header links on wider screens. */
export const PORTAL_TABS: NavItem[] = [
  { label: 'Home', icon: 'home', route: PORTAL_PATH, access: AUTHENTICATED, exact: true },
  { label: 'Visits', icon: 'event', route: `${PORTAL_PATH}/appointments`, access: AUTHENTICATED },
  {
    label: 'Results',
    icon: 'lab_research',
    route: `${PORTAL_PATH}/results`,
    access: AUTHENTICATED,
  },
  {
    label: 'Invoices',
    icon: 'receipt_long',
    route: `${PORTAL_PATH}/invoices`,
    access: AUTHENTICATED,
  },
  { label: 'Profile', icon: 'person', route: `${PORTAL_PATH}/profile`, access: AUTHENTICATED },
];

/** The rest of the portal, reached from the home page and the account menu. */
export const PORTAL_MORE: NavItem[] = [
  {
    label: 'Treatments',
    icon: 'physical_therapy',
    route: `${PORTAL_PATH}/treatments`,
    access: AUTHENTICATED,
    description: 'Your treatment plans and sessions',
  },
  {
    label: 'Prescriptions',
    icon: 'medication',
    route: `${PORTAL_PATH}/prescriptions`,
    access: AUTHENTICATED,
    description: 'Medicines to collect, with the code for the pharmacy',
  },
  {
    label: 'Sick leaves',
    icon: 'sick',
    route: `${PORTAL_PATH}/sick-leaves`,
    access: AUTHENTICATED,
    description: 'Your sick leave certificates, ready to print',
  },
  {
    label: 'Messages',
    icon: 'notifications',
    route: `${PORTAL_PATH}/notifications`,
    access: AUTHENTICATED,
    description: 'Reminders and updates from the clinic',
  },
];

/** Where a portal message leads, by its related record alias. */
export const PORTAL_RELATED_ROUTES: Record<string, string> = {
  appointment: `${PORTAL_PATH}/appointments`,
  treatment: `${PORTAL_PATH}/treatments`,
  clinical_order: `${PORTAL_PATH}/results`,
  prescription: `${PORTAL_PATH}/prescriptions`,
  sick_leave: `${PORTAL_PATH}/sick-leaves`,
  invoice: `${PORTAL_PATH}/invoices`,
  payment: `${PORTAL_PATH}/invoices`,
};

import { ClinicInfo } from '@interfaces/public/clinic-info.interface';
import { ServiceLine } from '@interfaces/public/service-line.interface';
import { VisitStep } from '@interfaces/public/visit-step.interface';

/**
 * Public facts shown on the website. Replace with the clinic's real details before go-live
 * (phone numbers and address below are placeholders).
 */
export const CLINIC_INFO: ClinicInfo = {
  name: 'e-Clinic',
  tagline: 'Family medicine, imaging, lab and physiotherapy under one roof in Seef.',
  phone: '+973 1700 0000',
  whatsapp: '+973 3600 0000',
  email: 'care@eclinic.bh',
  addressLines: ['Building 2504, Road 2832', 'Block 428, Seef', 'Kingdom of Bahrain'],
  mapUrl: 'https://maps.google.com/?q=Seef,+Bahrain',
  hours: [
    { day: 6, opens: '08:00', closes: '21:00' },
    { day: 0, opens: '08:00', closes: '21:00' },
    { day: 1, opens: '08:00', closes: '21:00' },
    { day: 2, opens: '08:00', closes: '21:00' },
    { day: 3, opens: '08:00', closes: '21:00' },
    { day: 4, opens: '08:00', closes: '21:00' },
    { day: 5, opens: '16:00', closes: '21:00' },
  ],
  emergencyNote: 'For a medical emergency call 999 or go to the nearest emergency department.',
};

export const CLINIC_SERVICES: ServiceLine[] = [
  {
    icon: 'stethoscope',
    featured: true,
    title: 'Family & general medicine',
    description:
      'Check-ups, acute illness, long-term conditions and referrals for every age. Most patients see the same doctor every time, so you only explain your history once.',
  },
  {
    icon: 'radiology',
    title: 'X-ray & imaging',
    description: 'Digital X-ray on site; images and reports go straight to your doctor.',
  },
  {
    icon: 'labs',
    title: 'Laboratory',
    description: 'Blood and urine tests with results released to your portal once reviewed.',
  },
  {
    icon: 'physical_therapy',
    title: 'Physiotherapy & treatment plans',
    description:
      'Session plans with progress tracked visit by visit and reminders before each one.',
  },
  {
    icon: 'medication',
    title: 'Pharmacy',
    description: 'Prescriptions filled at our counter — show the QR code from your prescription.',
  },
  {
    icon: 'health_and_safety',
    title: 'Insurance',
    description: 'Direct billing with the insurers we work with; bring your card and CPR.',
  },
];

export const VISIT_STEPS: VisitStep[] = [
  {
    title: 'Book',
    description:
      'Call reception or book in the patient portal; you get an SMS confirmation and a reminder the day before.',
  },
  {
    title: 'Check in',
    description:
      'Show the QR code from your confirmation at the front desk, with your CPR and insurance card.',
  },
  {
    title: 'See your doctor',
    description:
      'Tests, X-rays and prescriptions are ordered during the visit and handled in the same building.',
  },
  {
    title: 'Follow up at home',
    description:
      'Results, prescriptions and invoices appear in the patient portal as soon as they are released.',
  },
];

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

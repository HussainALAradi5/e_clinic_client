import { EmployeeStatus } from '@enums/hr/employee-status.enum';
import { Gender } from '@enums/shared/gender.enum';
import { ServiceRef } from '@interfaces/billing/service-ref.interface';
import { DepartmentRef } from '@interfaces/hr/department-ref.interface';

/** Mirror of DoctorResource — clinical profile of an employee (same id as employee, user and person). */
export interface Doctor {
  id: string;
  code: string;
  fullName: string;
  displayName: string;
  gender: Gender;
  /** Staff only — patients see the public profile. */
  phone?: string;
  email?: string | null;
  jobTitle?: string;
  employeeStatus?: EmployeeStatus;
  department?: DepartmentRef;
  specialtyId: string;
  specialty?: { id: string; code: string; name: string };
  licenseNumber: string;
  licenseExpiryDate: string;
  title: string | null;
  consultationServiceId: string;
  consultationService?: ServiceRef;
  followUpServiceId: string;
  followUpService?: ServiceRef;
  defaultSlotMinutes: number;
  maxDailyAppointments: number | null;
  isAcceptingPatients: boolean;
  isBookable: boolean | null;
  defaultRoomId: string | null;
  defaultRoom?: { id: string; code: string; name: string } | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

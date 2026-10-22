import { DepartmentRef } from '@shared/interfaces/hr/department.interface';
import { ServiceRef } from '@shared/interfaces/billing/billable-service.interface';
import { EmployeeStatus } from '@shared/enums/hr/employee-status.enum';
import { Gender } from '@shared/enums/shared/gender.enum';
import { GenericEntity } from '@shared/interfaces/common/generic-entity.interface';

/** Mirror of SpecialtyResource. */
export interface Specialty extends GenericEntity {
  name: string;
  nameAr: string | null;
  description: string | null;
  doctorsCount?: number;
}

/** POST / PUT /doctors/specialties. */
export interface SpecialtyPayload {
  code?: string;
  name?: string;
  nameAr?: string | null;
  description?: string | null;
}

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

/** POST /doctors (`employeeId` on create only) and PUT /doctors/{id}. */
export interface DoctorPayload {
  employeeId?: string;
  specialtyId?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  title?: string | null;
  consultationServiceId?: string;
  followUpServiceId?: string;
  defaultSlotMinutes?: number;
  maxDailyAppointments?: number | null;
  defaultRoomId?: string | null;
  bio?: string | null;
}

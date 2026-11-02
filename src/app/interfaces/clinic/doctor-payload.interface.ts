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

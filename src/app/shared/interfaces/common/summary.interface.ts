/** Mirror of App\Shared\Http\Resources\Summary::patient() — a patient line embedded in another record. */
export interface PatientSummary {
  id: string;
  code: string;
  fullName: string;
  phone: string | null;
}

/** Mirror of Summary::user() — a staff member who did something (received, approved, issued …). */
export interface UserSummary {
  id: string;
  fullName: string;
}

/** Mirror of Summary::employee() — a staff member line with job title and department. */
export interface EmployeeSummary {
  id: string;
  code: string;
  fullName: string;
  jobTitle: string;
  department: { id: string; name: string } | null;
}

/** Mirror of Summary::employee() — a staff member line with job title and department. */
export interface EmployeeSummary {
  id: string;
  code: string;
  fullName: string;
  jobTitle: string;
  department: { id: string; name: string } | null;
}

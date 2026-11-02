/** Mirror of App\Shared\Http\Resources\Summary::patient() — a patient line embedded in another record. */
export interface PatientSummary {
  id: string;
  code: string;
  fullName: string;
  phone: string | null;
}

/** Someone on a shift (ShiftResource.employees). */
export interface ShiftMember {
  id: string;
  code: string;
  fullName: string;
  avatarUrl: string | null;
  jobTitle: string;
  department: string | null;
}

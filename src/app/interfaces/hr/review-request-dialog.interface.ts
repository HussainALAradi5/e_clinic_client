import { StaffRequest } from '@interfaces/hr/staff-request.interface';

export interface ReviewRequestDialogData {
  request: StaffRequest;
  decision: 'approve' | 'reject';
}

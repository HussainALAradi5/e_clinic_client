/** Mirror of ApprovalStatus — leave requests, refunds, expenses, insurance claims. */
export enum ApprovalStatus {
  Draft = 'draft',
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
}

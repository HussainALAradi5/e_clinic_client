/** Mirror of App\Enums\Identity\AuditAction — Action recorded in audit_logs. */
export enum AuditAction {
  Created = 'created',
  Updated = 'updated',
  Deleted = 'deleted',
  Restored = 'restored',
  StatusChanged = 'status_changed',
  Login = 'login',
  Logout = 'logout',
  LoginFailed = 'login_failed',
  PasswordChanged = 'password_changed',
  PermissionChanged = 'permission_changed',
  Exported = 'exported',
  Posted = 'posted',
  Reversed = 'reversed',
  Approved = 'approved',
}

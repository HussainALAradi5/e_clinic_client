import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AuditLog } from '@interfaces/identity/audit-log.interface';
import { auditChanges } from '@utilities/audit';

/** Field / before / after table of one audit entry (sensitive values arrive masked as `***`). */
@Component({
  selector: 'ui-audit-changes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './audit-changes.component.html',
})
export class AuditChanges {
  readonly entry = input.required<Pick<AuditLog, 'oldValues' | 'newValues'>>();

  protected readonly changes = computed(() => auditChanges(this.entry()));
}

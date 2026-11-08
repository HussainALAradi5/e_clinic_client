import { dateTimeFormat } from '@utilities/clock-format';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuditChanges } from '@components/common/audit-changes/audit-changes.component';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { AuditLogApi } from '@services/identity/audit-log-api.service';
import { AUDIT_HISTORY_TEXT } from '@constants/common/audit-history.constants';

/**
 * History tab of any record: `<ui-audit-history type="role" [id]="role.id" />` (GET /audit-logs/{type}/{id}).
 * Shown only to users with audit access — wrap it in `*hasAccess="'audit.read_all | audit.read_own'"`.
 */
@Component({
  selector: 'ui-audit-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatExpansionModule,
    AuditChanges,
    EmptyState,
    ErrorState,
    Skeleton,
    DatePipe,
    EnumLabelPipe,
  ],
  host: { class: 'block' },
  templateUrl: './audit-history.component.html',
})
export class AuditHistory {
  protected readonly text = AUDIT_HISTORY_TEXT;

  readonly type = input.required<string>();
  readonly id = input.required<string>();

  private readonly api = inject(AuditLogApi);
  protected readonly dateTimeFormat = dateTimeFormat;
  protected readonly entries = rxResource({
    params: () => ({ type: this.type(), id: this.id() }),
    stream: ({ params }) => this.api.forModel(params.type, params.id),
  });
}

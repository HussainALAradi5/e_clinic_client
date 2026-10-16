import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuditChanges } from '@shared/components/audit-changes/audit-changes.component';
import { EmptyState } from '@shared/components/empty-state/empty-state.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { DATE_FORMAT, TIME_FORMAT } from '@shared/constants/app.constants';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { AuditLogApi } from '@shared/services/identity/audit-log-api.service';

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
  readonly type = input.required<string>();
  readonly id = input.required<string>();

  private readonly api = inject(AuditLogApi);
  protected readonly dateTimeFormat = `${DATE_FORMAT}, ${TIME_FORMAT}`;
  protected readonly entries = rxResource({
    params: () => ({ type: this.type(), id: this.id() }),
    stream: ({ params }) => this.api.forModel(params.type, params.id),
  });
}

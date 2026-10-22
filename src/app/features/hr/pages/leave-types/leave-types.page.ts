import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { firstValueFrom } from 'rxjs';
import { HrActions } from '../../services/hr-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { LeaveType } from '@shared/interfaces/hr/leave.interface';
import { QtyPipe } from '@shared/pipes/qty.pipe';
import { LeaveApi } from '@shared/services/hr/leave-api.service';

/** `/hr/leave-types` — the kinds of leave staff can request, their yearly days and rules. */
@Component({
  selector: 'app-leave-types-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, AppButton, Skeleton, MatCardModule, QtyPipe],
  templateUrl: './leave-types.page.html',
})
export class LeaveTypesPage implements OnInit {
  private readonly api = inject(LeaveApi);
  private readonly actions = inject(HrActions);
  protected readonly types = signal<LeaveType[] | null>(null);
  protected readonly variants = ButtonVariant;

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  protected readonly create = (): Promise<void> => this.edit(null);

  protected readonly edit = async (type: LeaveType | null): Promise<void> => {
    if (await this.actions.editLeaveType(type)) await this.load();
  };

  private async load(): Promise<void> {
    this.types.set(await firstValueFrom(this.api.types(true)));
  }
}

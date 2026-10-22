import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PharmacyActions } from '../../services/pharmacy-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { EmptyState } from '@shared/components/empty-state/empty-state.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Medication } from '@shared/interfaces/pharmacy/medication.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { QtyPipe } from '@shared/pipes/qty.pipe';
import { MedicationApi } from '@shared/services/pharmacy/medication-api.service';
import { percentOf } from '@shared/utils/quantity';

/** `/pharmacy/low-stock` — medicines at or below their reorder level, to reorder or receive. */
@Component({
  selector: 'app-low-stock-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    EmptyState,
    Skeleton,
    MatCardModule,
    MatIconModule,
    RouterLink,
    EnumLabelPipe,
    QtyPipe,
  ],
  templateUrl: './low-stock.page.html',
})
export class LowStockPage implements OnInit {
  private readonly api = inject(MedicationApi);
  private readonly actions = inject(PharmacyActions);
  protected readonly medications = signal<Medication[] | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly variants = ButtonVariant;

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.error.set(null);
    try {
      this.medications.set(await firstValueFrom(this.api.lowStock()));
    } catch (error) {
      this.error.set(error);
    }
  }

  /** On-hand as a share of the reorder level (the bar under each medicine). */
  protected level(medication: Medication): number {
    return percentOf(medication.stockOnHand, String(medication.reorderLevel));
  }

  protected readonly receive = async (medication: Medication): Promise<void> => {
    if (await this.actions.receive(medication)) await this.load();
  };
}

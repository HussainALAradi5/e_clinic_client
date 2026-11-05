import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { AppButton } from '@components/common/app-button/app-button.component';
import { ProgressBar } from '@components/common/progress-bar/progress-bar.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { PACKAGE_TEXT } from '@constants/billing/package.constants';
import { PatientPackageStatus } from '@enums/billing/patient-package-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { StatusTone } from '@enums/ui/status-tone.enum';
import { PatientPackage } from '@interfaces/billing/patient-package.interface';
import { PatientSummary } from '@interfaces/common/summary.interface';
import { BillingActions } from '@services/billing/billing-actions.service';
import { PackageApi } from '@services/billing/package-api.service';

/**
 * A patient's packages: sessions used as a bar, validity and status; staff who may sell see **Sell package**.
 * Shared by the patient file and the patient's own invoices page (read-only there). Hidden when there are none
 * and nothing can be sold.
 */
@Component({
  selector: 'app-patient-packages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButton, ProgressBar, StatusChip, MatIconModule, DatePipe],
  host: { class: 'block' },
  templateUrl: './patient-packages.component.html',
})
export class PatientPackages implements OnInit {
  readonly patient = input.required<PatientSummary>();
  /** Staff: may sell. */
  readonly manage = input(true);
  /** Emits after a sale (the invoice changed). */
  readonly changed = output<void>();

  private readonly api = inject(PackageApi);
  private readonly actions = inject(BillingActions);
  protected readonly packages = signal<PatientPackage[] | null>(null);
  protected readonly text = PACKAGE_TEXT;
  protected readonly variants = ButtonVariant;
  protected readonly statuses = PatientPackageStatus;
  protected readonly tones = StatusTone;
  protected readonly dateFormat = DATE_FORMAT;

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.packages.set(await firstValueFrom(this.api.ofPatient(this.patient().id)).catch(() => []));
  }

  protected readonly sell = async (): Promise<void> => {
    if (await this.actions.sellPackage(this.patient())) {
      await this.load();
      this.changed.emit();
    }
  };
}

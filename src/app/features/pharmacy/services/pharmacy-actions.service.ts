import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { StockLocation } from '@shared/enums/pharmacy/stock-location.enum';
import { AdjustStockDialog } from '../components/adjust-stock-dialog/adjust-stock-dialog.component';
import { TransferStockDialog } from '../components/transfer-stock-dialog/transfer-stock-dialog.component';
import { AdministerDialog } from '../components/administer-dialog/administer-dialog.component';
import { MedicationFormDialog } from '../components/medication-form-dialog/medication-form-dialog.component';
import { PrescriptionFormDialog } from '../components/prescription-form-dialog/prescription-form-dialog.component';
import { ReceiveStockDialog } from '../components/receive-stock-dialog/receive-stock-dialog.component';
import {
  AdjustStockDialogData,
  TransferStockDialogData,
  AdministerDialogData,
  MedicationFormDialogData,
  PrescriptionFormDialogData,
  ReceiveStockDialogData,
} from '../interfaces/dialog-data.interface';
import { Dispensation } from '@shared/interfaces/pharmacy/dispensation.interface';
import { MedicationBatch, StockMovement } from '@shared/interfaces/pharmacy/inventory.interface';
import { Medication } from '@shared/interfaces/pharmacy/medication.interface';
import { Prescription } from '@shared/interfaces/pharmacy/prescription.interface';
import { DispensationApi } from '@shared/services/pharmacy/dispensation-api.service';
import { InventoryApi } from '@shared/services/pharmacy/inventory-api.service';
import { MedicationApi } from '@shared/services/pharmacy/medication-api.service';
import { PrescriptionApi } from '@shared/services/pharmacy/prescription-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { formatQty } from '@shared/utils/quantity';

/**
 * Pharmacy steps with their dialogs, confirmations and messages, for the pharmacy pages and the clinic pages that
 * prescribe or give medicines. Each returns the changed record, or undefined when the user backed out.
 */
@Injectable({ providedIn: 'root' })
export class PharmacyActions {
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly medications = inject(MedicationApi);
  private readonly prescriptions = inject(PrescriptionApi);
  private readonly dispensations = inject(DispensationApi);
  private readonly inventory = inject(InventoryApi);

  // Catalogue

  editMedication(medication: Medication | null): Promise<Medication | undefined> {
    return this.dialogs.openAction<MedicationFormDialog, MedicationFormDialogData, Medication>(
      MedicationFormDialog,
      { medication },
      (m) => `${m.name} saved.`,
      '760px',
    );
  }

  async archiveMedication(medication: Medication): Promise<Medication | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Archive ${medication.name}?`,
      message: 'It leaves the pickers and the price list; its stock and history stay.',
      confirmLabel: 'Archive',
    });
    if (!ok) return undefined;
    const archived = await firstValueFrom(this.medications.archive(medication.id));
    this.notify.success(`${archived.name} archived.`);
    return archived;
  }

  async unarchiveMedication(medication: Medication): Promise<Medication | undefined> {
    const back = await firstValueFrom(this.medications.unarchive(medication.id));
    this.notify.success(`${back.name} is back in the catalogue.`);
    return back;
  }

  // Stock

  receive(medication: Medication | null = null): Promise<MedicationBatch | undefined> {
    return this.dialogs.openAction<ReceiveStockDialog, ReceiveStockDialogData, MedicationBatch>(
      ReceiveStockDialog,
      { medication },
      (b) => `Lot ${b.batchNumber} received — ${formatQty(b.qtyOnHand)} on hand.`,
      '720px',
    );
  }

  adjust(batch: MedicationBatch): Promise<StockMovement | undefined> {
    return this.dialogs.openAction<AdjustStockDialog, AdjustStockDialogData, StockMovement>(
      AdjustStockDialog,
      { batch },
      (m) => `Count corrected by ${formatQty(m.quantity)}.`,
    );
  }

  /** Moves units of a lot to the other place: pharmacy → treatment room (ward stock) or back. */
  transfer(batch: MedicationBatch): Promise<MedicationBatch | undefined> {
    return this.dialogs.openAction<TransferStockDialog, TransferStockDialogData, MedicationBatch>(
      TransferStockDialog,
      { batch },
      (b) =>
        `${formatQty(b.qtyOnHand)} of lot ${b.batchNumber} now in the ${b.location === StockLocation.TreatmentRoom ? 'treatment room' : 'pharmacy'}.`,
    );
  }

  async quarantine(batch: MedicationBatch): Promise<MedicationBatch | undefined> {
    const blocking = !batch.isQuarantined;
    const reason = await this.dialogs.reason({
      title: blocking
        ? `Quarantine lot ${batch.batchNumber}?`
        : `Release lot ${batch.batchNumber}?`,
      message: blocking
        ? 'Nothing is dispensed from a quarantined lot (recall, damage) until it is released.'
        : 'The lot can be dispensed again, first expiry first.',
      confirmLabel: blocking ? 'Quarantine' : 'Release',
      danger: blocking,
    });
    if (!reason) return undefined;
    const changed = await firstValueFrom(this.inventory.quarantine(batch.id, blocking, reason));
    this.notify.success(
      blocking ? `Lot ${changed.batchNumber} quarantined.` : `Lot ${changed.batchNumber} released.`,
    );
    return changed;
  }

  // Prescriptions & dispensing

  prescribe(data: PrescriptionFormDialogData): Promise<Prescription | undefined> {
    return this.dialogs.openAction<
      PrescriptionFormDialog,
      PrescriptionFormDialogData,
      Prescription
    >(
      PrescriptionFormDialog,
      data,
      (p) =>
        data.prescription
          ? `Prescription ${p.code} updated.`
          : `Prescription ${p.code} sent to the pharmacy.`,
      '960px',
    );
  }

  async cancelPrescription(prescription: Prescription): Promise<Prescription | undefined> {
    const reason = await this.dialogs.reason({
      title: `Cancel prescription ${prescription.code}?`,
      message: 'What is not yet dispensed can no longer be collected.',
      confirmLabel: 'Cancel prescription',
      cancelLabel: 'Keep',
      danger: true,
    });
    if (!reason) return undefined;
    const cancelled = await firstValueFrom(this.prescriptions.cancel(prescription.id, reason));
    this.notify.success(`Prescription ${cancelled.code} cancelled.`);
    return cancelled;
  }

  administer(data: AdministerDialogData): Promise<Dispensation | undefined> {
    return this.dialogs.openAction<AdministerDialog, AdministerDialogData, Dispensation>(
      AdministerDialog,
      data,
      (d) => `Recorded on the session (${d.code}) and added to the patient's invoice.`,
      '880px',
    );
  }

  async returnToStock(dispensation: Dispensation): Promise<Dispensation | undefined> {
    const reason = await this.dialogs.reason({
      title: `Return ${dispensation.code} to stock?`,
      message:
        "Same day, unopened only: the medicines go back on their lots and come off the patient's draft invoice.",
      confirmLabel: 'Return to stock',
      danger: true,
    });
    if (!reason) return undefined;
    const returned = await firstValueFrom(this.dispensations.cancel(dispensation.id, reason));
    this.notify.success(`${returned.code} returned to stock.`);
    return returned;
  }
}

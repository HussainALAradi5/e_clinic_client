import {
  ClinicalOrderType,
  IMAGING_ORDER_TYPES,
} from '@shared/enums/clinic/clinical-order-type.enum';
import { RoomType } from '@shared/enums/clinic/room-type.enum';
import { AttachmentCategory } from '@shared/enums/attachment/attachment-category.enum';

/** Room type an order is performed in (server: ClinicalOrderType::roomType); null for referrals. */
export function orderRoomType(type: ClinicalOrderType): RoomType | null {
  if (IMAGING_ORDER_TYPES.includes(type)) return RoomType.Xray;
  if (type === ClinicalOrderType.LabTest) return RoomType.Laboratory;
  if (type === ClinicalOrderType.Ecg) return RoomType.TreatmentRoom;
  return null;
}

/** Category of the files attached to a result. */
export function resultCategory(type: ClinicalOrderType): AttachmentCategory {
  if (IMAGING_ORDER_TYPES.includes(type)) return AttachmentCategory.XrayImage;
  if (type === ClinicalOrderType.Referral) return AttachmentCategory.ReferralLetter;
  return AttachmentCategory.LabResult;
}

/** Work-list tabs of the orders desk. */
export const ORDER_DESKS: readonly { label: string; icon: string; types: ClinicalOrderType[] }[] = [
  { label: 'Imaging', icon: 'radiology', types: [...IMAGING_ORDER_TYPES] },
  { label: 'Laboratory', icon: 'biotech', types: [ClinicalOrderType.LabTest] },
  { label: 'ECG', icon: 'monitor_heart', types: [ClinicalOrderType.Ecg] },
  { label: 'Referrals', icon: 'forward_to_inbox', types: [ClinicalOrderType.Referral] },
];

/** kg / m² with one decimal (the server sends the same value once saved). */
export function bmi(
  weightKg: number | null | undefined,
  heightCm: number | null | undefined,
): number | null {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

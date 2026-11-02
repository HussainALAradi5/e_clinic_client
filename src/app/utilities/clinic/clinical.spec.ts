import { bmi, orderRoomType, resultCategory } from './clinical';
import { AttachmentCategory } from '@enums/attachment/attachment-category.enum';
import { ClinicalOrderType } from '@enums/clinic/clinical-order-type.enum';
import { RoomType } from '@enums/clinic/room-type.enum';

describe('clinical utils', () => {
  it('computes BMI with one decimal, only with both measures', () => {
    expect(bmi(80, 180)).toBe(24.7);
    expect(bmi(80, null)).toBeNull();
    expect(bmi(null, 180)).toBeNull();
  });

  it('maps order types to their room and result file category', () => {
    expect(orderRoomType(ClinicalOrderType.Mri)).toBe(RoomType.Xray);
    expect(orderRoomType(ClinicalOrderType.LabTest)).toBe(RoomType.Laboratory);
    expect(orderRoomType(ClinicalOrderType.Referral)).toBeNull();
    expect(resultCategory(ClinicalOrderType.Ct)).toBe(AttachmentCategory.XrayImage);
    expect(resultCategory(ClinicalOrderType.Ecg)).toBe(AttachmentCategory.LabResult);
    expect(resultCategory(ClinicalOrderType.Referral)).toBe(AttachmentCategory.ReferralLetter);
  });
});

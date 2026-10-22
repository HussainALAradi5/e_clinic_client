/** Mirror of App\Enums\Appointments\ClinicalOrderType — imaging, lab, ECG or referral. */
export enum ClinicalOrderType {
  Xray = 'xray',
  Ultrasound = 'ultrasound',
  Ct = 'ct',
  Mri = 'mri',
  LabTest = 'lab_test',
  Ecg = 'ecg',
  Referral = 'referral',
}

/** Imaging results need at least one image (server: ClinicalOrderType::isImaging). */
export const IMAGING_ORDER_TYPES: readonly ClinicalOrderType[] = [
  ClinicalOrderType.Xray,
  ClinicalOrderType.Ultrasound,
  ClinicalOrderType.Ct,
  ClinicalOrderType.Mri,
];

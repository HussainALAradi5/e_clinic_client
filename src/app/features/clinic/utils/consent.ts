import { ConsentType } from '@shared/enums/clinic/consent-type.enum';

/** Who signs for the patient. */
export const SIGNER_RELATIONSHIPS = [
  { value: 'self', label: 'The patient' },
  { value: 'parent', label: 'Parent' },
  { value: 'guardian', label: 'Legal guardian' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Son / daughter' },
  { value: 'other', label: 'Other representative' },
];

/** Consent types that always cover the whole patient file (server: PatientConsent::PATIENT_WIDE). */
export const PATIENT_WIDE_CONSENTS: readonly ConsentType[] = [
  ConsentType.GeneralTreatment,
  ConsentType.DataSharing,
  ConsentType.Photography,
];

/** Starting text the clinician adapts before the patient signs. */
export const CONSENT_TEMPLATES: Record<ConsentType, string> = {
  [ConsentType.GeneralTreatment]:
    'I agree to be examined and treated by the clinic staff. The usual tests and treatments were explained to me, and I may ask questions or withdraw at any time.',
  [ConsentType.Procedure]:
    'The procedure, its purpose, the expected benefits, the risks (bleeding, infection, pain, scarring) and the alternatives, including no treatment, were explained to me.',
  [ConsentType.Anesthesia]:
    'The type of anaesthesia, its risks (nausea, allergic reaction, breathing problems) and the alternatives were explained to me. I followed the fasting instructions.',
  [ConsentType.ContrastMedia]:
    'The use of contrast medium, the risk of allergic reaction and kidney effects were explained to me. I have told the staff about allergies and kidney disease.',
  [ConsentType.Telemedicine]:
    'I agree to be seen by video or phone. The limits of a remote consultation and how my data is protected were explained to me.',
  [ConsentType.Photography]:
    'I agree to clinical photographs being taken for my medical record. They will not be shared outside my care without my written permission.',
  [ConsentType.DataSharing]:
    'I agree that my medical information may be shared with my insurer and with other providers involved in my care, as explained to me.',
};

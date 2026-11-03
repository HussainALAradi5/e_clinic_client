import { FormControl, FormGroup } from '@angular/forms';
import { BloodGroup } from '@enums/clinic/blood-group.enum';
import { EmergencyContactsForm } from '@interfaces/clinic/emergency-contact-form.interface';

export type PatientForm = FormGroup<{
  bloodGroup: FormControl<BloodGroup | null>;
  allergies: FormControl<string | null>;
  chronicConditions: FormControl<string | null>;
  familyHistory: FormControl<string | null>;
  surgicalHistory: FormControl<string | null>;
  emergencyContacts: EmergencyContactsForm;
  insuranceCompanyId: FormControl<string | null>;
  insurancePolicyNumber: FormControl<string | null>;
  insuranceExpiryDate: FormControl<string | null>;
  insuranceCoveragePercent: FormControl<string | null>;
  notes: FormControl<string | null>;
}>;

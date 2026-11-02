import { FormControl, FormGroup } from '@angular/forms';
import { BloodGroup } from '@enums/clinic/blood-group.enum';

export type PatientForm = FormGroup<{
  bloodGroup: FormControl<BloodGroup | null>;
  allergies: FormControl<string | null>;
  chronicConditions: FormControl<string | null>;
  familyHistory: FormControl<string | null>;
  surgicalHistory: FormControl<string | null>;
  emergencyContactName: FormControl<string | null>;
  emergencyContactPhone: FormControl<string | null>;
  emergencyContactRelation: FormControl<string | null>;
  insuranceCompanyId: FormControl<string | null>;
  insurancePolicyNumber: FormControl<string | null>;
  insuranceExpiryDate: FormControl<string | null>;
  insuranceCoveragePercent: FormControl<string | null>;
  notes: FormControl<string | null>;
}>;

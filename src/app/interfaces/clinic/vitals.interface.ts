/** Vital signs of a visit; BMI is computed by the server. */
export interface Vitals {
  temperatureC: number | null;
  pulseBpm: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  respiratoryRate: number | null;
  spo2Percent: number | null;
  weightKg: number | null;
  heightCm: number | null;
  bmi?: number | null;
}

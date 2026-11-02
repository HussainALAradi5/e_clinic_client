/** Minimal typing of the browser Shape Detection API (Chromium / Android) used by the scan station camera. */
export interface DetectedBarcode {
  rawValue: string;
  format: string;
}

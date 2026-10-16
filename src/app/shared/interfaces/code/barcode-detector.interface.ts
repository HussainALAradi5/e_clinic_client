/** Minimal typing of the browser Shape Detection API (Chromium / Android) used by the scan station camera. */
export interface DetectedBarcode {
  rawValue: string;
  format: string;
}

export interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}

export interface BarcodeDetectorConstructor {
  new (options?: { formats: string[] }): BarcodeDetectorLike;
  getSupportedFormats(): Promise<string[]>;
}

/** One resolved scan kept in the station's history. */
export interface ScanHistoryEntry {
  at: number;
  payload: string;
  ok: boolean;
  label: string;
}

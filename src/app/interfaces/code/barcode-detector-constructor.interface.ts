import { BarcodeDetectorLike } from '@interfaces/code/barcode-detector-like.interface';

export interface BarcodeDetectorConstructor {
  new (options?: { formats: string[] }): BarcodeDetectorLike;
  getSupportedFormats(): Promise<string[]>;
}

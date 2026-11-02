import { DetectedBarcode } from '@interfaces/code/barcode-detector.interface';

export interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}

import { CodeSymbology } from '@shared/enums/code/code-symbology.enum';

/** GET /codes/{entity}/{id} options. */
export interface CodeImageOptions {
  symbology?: CodeSymbology;
  /** 64–1024 px */
  size?: number;
  format?: 'svg' | 'png';
}

/** Rendered code: object URL of the image + the signed payload text (X-Code-Payload). */
export interface CodeImage {
  url: string;
  payload: string;
}

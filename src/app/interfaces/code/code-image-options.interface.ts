import { CodeSymbology } from '@enums/code/code-symbology.enum';

/** GET /codes/{entity}/{id} options. */
export interface CodeImageOptions {
  symbology?: CodeSymbology;
  /** 64–1024 px */
  size?: number;
  format?: 'svg' | 'png';
}

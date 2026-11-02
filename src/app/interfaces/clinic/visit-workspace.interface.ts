import { VITAL_KEYS } from '@constants/visit.constants';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export type VitalKey = (typeof VITAL_KEYS)[number];

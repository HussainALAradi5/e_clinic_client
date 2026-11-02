import { GenericEntity } from '@interfaces/common/generic-entity.interface';

/** Mirror of SpecialtyResource. */
export interface Specialty extends GenericEntity {
  name: string;
  nameAr: string | null;
  description: string | null;
  doctorsCount?: number;
}

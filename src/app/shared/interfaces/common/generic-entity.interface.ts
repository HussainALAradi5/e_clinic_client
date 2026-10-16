/** Mirror of App\Shared\Contracts\GenericEntity (BaseModel columns, camelCased by the case interceptor). */
export interface GenericEntity {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isDeleted: boolean;
}

/** Records with optimistic locking (HasVersion) — send `version` back on update. */
export interface Versioned {
  version: number;
}

/** Records with created_by / updated_by (Blameable). */
export interface Blameable {
  createdBy?: string;
  updatedBy?: string;
}

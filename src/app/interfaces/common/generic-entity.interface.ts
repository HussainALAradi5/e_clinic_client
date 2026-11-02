/** Mirror of App\Shared\Contracts\GenericEntity (BaseModel columns, camelCased by the case interceptor). */
export interface GenericEntity {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isDeleted: boolean;
}

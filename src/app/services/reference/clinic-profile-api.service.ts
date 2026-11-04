import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '@config/api.config';
import { ENDPOINTS } from '@config/endpoints';
import { ClinicImage } from '@enums/reference/clinic-image.enum';
import { ClinicProfile } from '@interfaces/reference/clinic-profile.interface';
import { ClinicProfilePayload } from '@interfaces/reference/clinic-profile-payload.interface';
import { ApiClient } from '@services/api/api-client.service';

/** The clinic profile: read by everyone, changed by admins (name, contacts, logo, stamp on every PDF). */
@Injectable({ providedIn: 'root' })
export class ClinicProfileApi {
  private readonly api = inject(ApiClient);

  get(): Observable<ClinicProfile> {
    return this.api.get<ClinicProfile>(ENDPOINTS.clinicProfile.public);
  }

  update(payload: ClinicProfilePayload): Observable<ClinicProfile> {
    return this.api.put<ClinicProfile>(ENDPOINTS.clinicProfile.manage, payload);
  }

  uploadImage(image: ClinicImage, file: File): Observable<ClinicProfile> {
    const body = new FormData();
    body.append('image', file, file.name);
    return this.api.post<ClinicProfile>(`${ENDPOINTS.clinicProfile.manage}/${image}`, body);
  }

  removeImage(image: ClinicImage): Observable<void> {
    return this.api.delete(`${ENDPOINTS.clinicProfile.manage}/${image}`);
  }

  /** Full URL of a public image path from the profile (images are public, so an <img> loads them directly). */
  imageUrl(path: string | null): string | null {
    return path ? apiUrl(path) : null;
  }
}

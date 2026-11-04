import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ENDPOINTS } from '@config/endpoints';
import { PatientPackage } from '@interfaces/billing/patient-package.interface';
import {
  ServicePackage,
  ServicePackagePayload,
} from '@interfaces/billing/service-package.interface';
import { withIdempotencyKey } from '@middlewares/interceptors/http-context';
import { ApiClient } from '@services/api/api-client.service';
import { defaultQuery } from '@utilities/list-query';

/** Billing › Packages — the catalog and the packages patients bought (sessions instead of billing visits). */
@Injectable({ providedIn: 'root' })
export class PackageApi {
  private readonly api = inject(ApiClient);
  private readonly path = ENDPOINTS.billing.packages;

  create(payload: ServicePackagePayload): Observable<ServicePackage> {
    return this.api.post<ServicePackage>(this.path, payload);
  }

  update(id: string, payload: ServicePackagePayload): Observable<ServicePackage> {
    return this.api.put<ServicePackage>(`${this.path}/${id}`, payload);
  }

  /** A patient's packages, newest first. */
  ofPatient(patientId: string): Observable<PatientPackage[]> {
    const query = defaultQuery({
      perPage: 20,
      sort: ['-createdAt'],
      filter: { and: [{ patientId: { eq: patientId } }] },
    });
    return this.api
      .list<PatientPackage>(ENDPOINTS.billing.patientPackages, query)
      .pipe(map((p) => p.data));
  }

  /** Sells a package: a line on the patient's draft invoice; it activates once that invoice is paid. */
  sell(patientId: string, packageId: string, idempotencyKey: string): Observable<PatientPackage> {
    return this.api.post<PatientPackage>(
      `${ENDPOINTS.billing.patients}/${patientId}/packages`,
      { packageId },
      { context: withIdempotencyKey(idempotencyKey) },
    );
  }
}

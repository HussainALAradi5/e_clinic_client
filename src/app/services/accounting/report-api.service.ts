import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ReportType } from '@enums/accounting/report-type.enum';
import { ReportParams, ReportTable } from '@interfaces/accounting/report.interface';
import { ApiClient } from '@services/api/api-client.service';
import { downloadBlob } from '@utilities/download';

/** Accounting › Financial reports — every report is one table; export writes it to Excel or PDF. */
@Injectable({ providedIn: 'root' })
export class ReportApi {
  private readonly api = inject(ApiClient);
  private readonly http = inject(HttpClient);
  private readonly path = 'accounting/reports';

  build(type: ReportType, params: ReportParams): Observable<ReportTable> {
    return this.api.get<ReportTable>(`${this.path}/${type.replace(/_/g, '-')}`, {
      params: clean(params),
    });
  }

  export(type: ReportType, params: ReportParams, format: 'xlsx' | 'pdf'): Observable<void> {
    return this.http
      .post(
        `${this.path}/export`,
        { type, format, params: clean(params) },
        { responseType: 'blob', observe: 'response' },
      )
      .pipe(map((response) => downloadBlob(response, `${type}.${format}`)));
  }
}

/** Drops empty filters; booleans travel as 1 / 0. */
function clean(params: ReportParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue;
    out[key] = typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
  }
  return out;
}

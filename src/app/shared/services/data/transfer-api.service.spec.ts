import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ExportFormat } from '@shared/enums/list/export-format.enum';
import { TransferApi } from './transfer-api.service';

describe('TransferApi', () => {
  let api: TransferApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(TransferApi);
    http = TestBed.inject(HttpTestingController);
  });

  it('downloads a small export straight away', async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();

    const result = firstValueFrom(
      api.export('reference/companies', { format: ExportFormat.Xlsx, ids: ['1'] }),
    );
    const req = http.expectOne('reference/companies/export');
    expect(req.request.body).toEqual({ format: 'xlsx', ids: ['1'] });
    req.flush(new Blob(['xlsx']), {
      headers: { 'Content-Disposition': 'attachment; filename="companies-20261016-1640.xlsx"' },
    });

    expect(await result).toEqual({ downloaded: true });
    expect(click).toHaveBeenCalled();
  });

  it('returns the background task of a large export (202)', async () => {
    const result = firstValueFrom(api.export('people', { format: ExportFormat.Pdf }));
    const body = JSON.stringify({ success: true, data: { task_id: 't-1', rows: 5400 } });
    http
      .expectOne('people/export')
      .flush(new Blob([body]), { status: 202, statusText: 'Accepted' });

    expect(await result).toEqual({ downloaded: false, taskId: 't-1', rows: 5400 });
  });

  it('uploads the workbook as multipart form data', async () => {
    const file = new File(['x'], 'people.xlsx');
    const result = firstValueFrom(api.import('people', file));
    const req = http.expectOne('people/import');
    expect((req.request.body as FormData).get('file')).toBe(file);
    req.flush({ success: true, data: { resource: 'people', created: 2, ids: ['a', 'b'] } });

    expect(await result).toEqual({ resource: 'people', created: 2, ids: ['a', 'b'] });
  });
});

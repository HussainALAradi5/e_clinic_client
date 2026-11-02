import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { CompanyState } from '@interfaces/reference/company-state.interface';
import { ApiError } from '@interfaces/api/api-error.interface';
import { Company, CompanyPayload } from '@interfaces/reference/company.interface';
import { CompanyApi } from '@services/reference/company-api.service';

/** Company detail state (route-level) with every company action. */
export const CompanyStore = signalStore(
  withState<CompanyState>({ company: null, loading: false, error: null }),
  withMethods((store, api = inject(CompanyApi)) => {
    const id = (): string => store.company()?.id ?? '';
    /** Mutations return the company without usage counts; keep the ones already shown. */
    const keep = (company: Company): Company => {
      patchState(store, {
        company: { ...company, usage: company.usage ?? store.company()?.usage },
      });
      return company;
    };

    return {
      async load(companyId: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          patchState(store, { company: await firstValueFrom(api.get(companyId)), loading: false });
        } catch (error) {
          patchState(store, { loading: false, error: error as ApiError });
        }
      },
      async update(payload: CompanyPayload): Promise<Company> {
        return keep(await firstValueFrom(api.update(id(), payload)));
      },
      async archive(): Promise<Company> {
        return keep(await firstValueFrom(api.archive(id())));
      },
      async unarchive(): Promise<Company> {
        return keep(await firstValueFrom(api.unarchive(id())));
      },
      async restore(): Promise<Company> {
        return keep(await firstValueFrom(api.restore(id())));
      },
      remove(): Promise<void> {
        return firstValueFrom(api.remove(id()));
      },
    };
  }),
);

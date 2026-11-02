import { PayrollRun } from '@interfaces/hr/payroll-run.interface';

/** Mark an approved payroll as paid. */
export interface PayPayrollDialogData {
  run: PayrollRun;
}

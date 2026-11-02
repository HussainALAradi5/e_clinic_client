import { ReportType } from '@enums/accounting/report-type.enum';
import { ReportInputs } from '@interfaces/accounting/report-inputs.type';

export interface ReportDefinition {
  type: ReportType;
  label: string;
  description: string;
  icon: string;
  inputs: ReportInputs;
}

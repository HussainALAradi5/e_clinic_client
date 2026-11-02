import { EnvironmentProviders, Injectable, makeEnvironmentProviders } from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDateFormats,
  NativeDateAdapter,
} from '@angular/material/core';
import { CLINIC_LOCALE } from '@constants/app.constants';

/** Calendar value of an unusable typed date (never sent to the API). */
const INVALID = 'invalid';
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
/** Typed day-first dates: 22/10/2026, 22-10-2026, 22.10.2026. */
const DAY_FIRST = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/;

/** Shown in date fields and calendars: "22 Oct 2026"; the header reads "Oct 2026". */
const CLINIC_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: null },
  display: {
    dateInput: { day: 'numeric', month: 'short', year: 'numeric' },
    monthLabel: { month: 'short' },
    monthYearLabel: { month: 'short', year: 'numeric' },
    dateA11yLabel: { day: 'numeric', month: 'long', year: 'numeric' },
    monthYearA11yLabel: { month: 'long', year: 'numeric' },
  },
};

/**
 * Material calendars on the API's own date format: values are ISO dates (`2026-10-22`), exactly what forms and list
 * queries already hold, so no field converts Date objects or shifts days across time zones. Weeks start on Sunday,
 * as at the clinic. Calendar arithmetic is delegated to the native adapter.
 */
@Injectable()
export class IsoDateAdapter extends DateAdapter<string> {
  private readonly native = new NativeDateAdapter();

  constructor() {
    super();
    this.native.setLocale(CLINIC_LOCALE);
    this.setLocale(CLINIC_LOCALE);
  }

  private toDate(iso: string): Date {
    const [, y, m, d] = ISO.exec(iso) ?? [];
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  private toIso(date: Date): string {
    const pad = (n: number): string => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  getYear(date: string): number {
    return this.toDate(date).getFullYear();
  }

  getMonth(date: string): number {
    return this.toDate(date).getMonth();
  }

  getDate(date: string): number {
    return this.toDate(date).getDate();
  }

  getDayOfWeek(date: string): number {
    return this.toDate(date).getDay();
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    return this.native.getMonthNames(style);
  }

  getDateNames(): string[] {
    return this.native.getDateNames();
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    return this.native.getDayOfWeekNames(style);
  }

  getYearName(date: string): string {
    return String(this.getYear(date));
  }

  getFirstDayOfWeek(): number {
    return 0;
  }

  getNumDaysInMonth(date: string): number {
    return this.native.getNumDaysInMonth(this.toDate(date));
  }

  clone(date: string): string {
    return date;
  }

  createDate(year: number, month: number, date: number): string {
    return this.toIso(this.native.createDate(year, month, date));
  }

  today(): string {
    return this.toIso(new Date());
  }

  parse(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const text = value.trim();
    if (ISO.test(text)) return this.isValid(text) ? text : INVALID;
    const dayFirst = DAY_FIRST.exec(text);
    if (dayFirst) {
      const [, d, m, y] = dayFirst.map(Number);
      const date = new Date(y, m - 1, d);
      return date.getMonth() === m - 1 ? this.toIso(date) : INVALID;
    }
    const parsed = Date.parse(text);
    return Number.isNaN(parsed) ? INVALID : this.toIso(new Date(parsed));
  }

  format(date: string, displayFormat: object): string {
    return this.isValid(date) ? this.native.format(this.toDate(date), displayFormat) : '';
  }

  addCalendarYears(date: string, years: number): string {
    return this.toIso(this.native.addCalendarYears(this.toDate(date), years));
  }

  addCalendarMonths(date: string, months: number): string {
    return this.toIso(this.native.addCalendarMonths(this.toDate(date), months));
  }

  addCalendarDays(date: string, days: number): string {
    return this.toIso(this.native.addCalendarDays(this.toDate(date), days));
  }

  toIso8601(date: string): string {
    return date;
  }

  override deserialize(value: unknown): string | null {
    if (typeof value === 'string' && ISO.test(value)) return value;
    return value === null || value === '' ? null : super.deserialize(value);
  }

  isDateInstance(obj: unknown): boolean {
    return typeof obj === 'string' && (obj === INVALID || ISO.test(obj));
  }

  isValid(date: string): boolean {
    if (!ISO.test(date)) return false;
    const d = this.toDate(date);
    return this.toIso(d) === date;
  }

  invalid(): string {
    return INVALID;
  }
}

/** Material date pickers across the app: ISO values, clinic locale, Sunday-first weeks. */
export function provideClinicDates(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: MAT_DATE_LOCALE, useValue: CLINIC_LOCALE },
    { provide: DateAdapter, useClass: IsoDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CLINIC_DATE_FORMATS },
  ]);
}

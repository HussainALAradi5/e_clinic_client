import { reportCell, reportKind, reportLink } from './report';

describe('report rows', () => {
  it('reads camelCased cells with snake_case column keys', () => {
    const row = {
      patient: 'Ali',
      days3160: '12.000',
      Kind: 'group',
      Link: { type: 'patient', id: 'p1' },
    };
    expect(reportCell(row, 'days_31_60')).toBe('12.000');
    expect(reportCell(row, 'missing')).toBe('');
    expect(reportKind(row)).toBe('group');
    expect(reportLink(row)).toEqual(['/clinic/patients', 'p1']);
    expect(reportLink({})).toBeNull();
  });
});

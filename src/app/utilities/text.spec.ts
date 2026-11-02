import { formatBytes, humanise, initials } from '@utilities/text';

describe('humanise', () => {
  it('handles snake, kebab and camel case', () => {
    expect(humanise('in_progress')).toBe('In progress');
    expect(humanise('dateOfBirth')).toBe('Date of birth');
    expect(humanise('check-in')).toBe('Check in');
  });
});

describe('formatBytes', () => {
  it('uses binary units with one decimal', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

describe('initials', () => {
  it('takes the first and last name', () => {
    expect(initials('Rana Saleh')).toBe('RS');
    expect(initials('Grace Dela Cruz')).toBe('GC');
    expect(initials('  maryam ')).toBe('M');
    expect(initials(null)).toBe('');
  });
});

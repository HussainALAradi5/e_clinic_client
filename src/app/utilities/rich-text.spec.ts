import { RichText } from '@utilities/rich-text';

describe('RichText.excerpt', () => {
  it('drops tags, keeps placeholders, joins blocks with spaces and shortens long text', () => {
    expect(
      RichText.excerpt('<h2>Report</h2><p><strong>{{patient_name}}</strong> &amp; family</p>'),
    ).toBe('Report {{patient_name}} & family');
    expect(RichText.excerpt('<p>abcdefghij</p>', 6)).toBe('abcde…');
    expect(RichText.excerpt('')).toBe('');
  });
});

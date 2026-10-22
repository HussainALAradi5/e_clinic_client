import { countTotal } from './denominations';

describe('denominations', () => {
  it('adds notes and coins exactly', () => {
    expect(
      countTotal([
        { value: '20.000', count: 2 },
        { value: '0.500', count: 3 },
        { value: '0.005', count: 7 },
      ]),
    ).toBe('41.535');
    expect(countTotal([{ value: '1.000', count: -2 }])).toBe('0.000');
  });
});

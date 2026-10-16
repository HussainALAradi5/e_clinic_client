import { convertKeys, toCamel, toSnake, toSnakeParam } from './case';

describe('case conversion', () => {
  it('converts keys both ways without touching values', () => {
    const wire = {
      created_at: 'x',
      items: [{ unit_price: { amount: '1.000' } }],
      status: 'in_progress',
    };
    const app = convertKeys<Record<string, unknown>>(wire, toCamel);

    expect(app).toEqual({
      createdAt: 'x',
      items: [{ unitPrice: { amount: '1.000' } }],
      status: 'in_progress',
    });
    expect(convertKeys(app, toSnake)).toEqual(wire);
  });

  it('snakes bracketed query parameter names', () => {
    expect(toSnakeParam('filter[providerId][eq]')).toBe('filter[provider_id][eq]');
    expect(toSnakeParam('filter[or][0][status][in]')).toBe('filter[or][0][status][in]');
    expect(toSnake('spo2Percent')).toBe('spo2_percent');
  });

  it('leaves FormData and Blob bodies alone', () => {
    const form = new FormData();
    expect(convertKeys(form, toSnake)).toBe(form);
  });
});

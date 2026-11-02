import {
  evaluatePermissionExpression,
  parsePermissionExpression,
} from '@utilities/permission-expression';

/** Same cases as the server's PermissionExpressionTest — both sides must agree. */
describe('permission expressions', () => {
  const granted = new Set(['invoices.write', 'invoices.issue', 'refunds.read_own']);

  it.each([
    ['invoices.write&invoices.issue', true],
    ['invoices.write & payments.void', false],
    ['payments.void|invoices.issue', true],
    ['!payments.void', true],
    ['!(invoices.write|payments.void)', false],
    ['payments.void|invoices.write&invoices.issue', true],
    ['(payments.void|invoices.write)&!invoices.issue', false],
    ['(refunds.read_all|refunds.read_own)&invoices.issue', true],
  ])('%s → %s', (expression, expected) => {
    expect(evaluatePermissionExpression(expression, granted)).toBe(expected);
  });

  it('fails closed for unknown names and guests', () => {
    expect(evaluatePermissionExpression('unknown.permission', new Set())).toBe(false);
    expect(evaluatePermissionExpression('authenticated', null)).toBe(false);
    expect(evaluatePermissionExpression('authenticated', new Set())).toBe(true);
  });

  it('treats read_all as implying read_own', () => {
    expect(evaluatePermissionExpression('patients.read_own', new Set(['patients.read_all']))).toBe(
      true,
    );
  });

  it.each(['', 'a.read &', '(a.read', 'a.read b.write', 'a.read & $'])(
    'rejects malformed "%s"',
    (expression) => {
      expect(() => parsePermissionExpression(expression)).toThrow();
    },
  );
});

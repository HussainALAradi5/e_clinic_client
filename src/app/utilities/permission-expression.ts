import { AUTHENTICATED } from '@constants/app.constants';
import { Node } from '@interfaces/common/permission-expression.interface';

const cache = new Map<string, Node>();

export function parsePermissionExpression(expression: string): Node {
  const cached = cache.get(expression);
  if (cached) {
    return cached;
  }

  const tokens = expression.toLowerCase().match(/[a-z0-9_.]+|[&|!()]|\S/g) ?? [];
  if (tokens.length === 0) {
    throw new Error('Empty permission expression.');
  }

  let position = 0;
  const accept = (token: string): boolean => {
    if (tokens[position] === token) {
      position++;
      return true;
    }
    return false;
  };

  const parseOr = (): Node => {
    const children = [parseAnd()];
    while (accept('|')) {
      children.push(parseAnd());
    }
    return children.length === 1 ? children[0] : { kind: 'or', children };
  };

  const parseAnd = (): Node => {
    const children = [parseUnary()];
    while (accept('&')) {
      children.push(parseUnary());
    }
    return children.length === 1 ? children[0] : { kind: 'and', children };
  };

  const parseUnary = (): Node => {
    if (accept('!')) {
      return { kind: 'not', child: parseUnary() };
    }
    if (accept('(')) {
      const node = parseOr();
      if (!accept(')')) {
        throw new Error('Missing closing parenthesis in permission expression.');
      }
      return node;
    }
    const token = tokens[position];
    if (token === undefined || !/^[a-z0-9_.]+$/.test(token)) {
      throw new Error(
        `Expected a permission name, got ${token === undefined ? 'end of expression' : `'${token}'`}.`,
      );
    }
    position++;
    return { kind: 'perm', name: token };
  };

  const root = parseOr();
  if (position < tokens.length) {
    throw new Error(
      `Unexpected token '${tokens[position]}' in permission expression '${expression}'.`,
    );
  }

  cache.set(expression, root);
  return root;
}

/** Evaluates an expression against the user's granted permission names (null = guest). */
export function evaluatePermissionExpression(
  expression: string,
  granted: ReadonlySet<string> | null,
): boolean {
  if (granted === null) {
    return false;
  }

  const allows = (name: string): boolean => {
    if (name === AUTHENTICATED || granted.has(name)) {
      return true;
    }
    const [resource, flag] = name.split('.', 2);
    return flag === 'read_own' && granted.has(`${resource}.read_all`);
  };

  const evaluate = (node: Node): boolean => {
    switch (node.kind) {
      case 'perm':
        return allows(node.name);
      case 'not':
        return !evaluate(node.child);
      case 'and':
        return node.children.every(evaluate);
      case 'or':
        return node.children.some(evaluate);
    }
  };

  return evaluate(parsePermissionExpression(expression));
}

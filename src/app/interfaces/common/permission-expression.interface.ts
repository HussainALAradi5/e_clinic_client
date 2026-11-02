export /**
 * Same grammar as the server's App\Shared\Access\PermissionExpression:
 * `&` (AND), `|` (OR), `!` (NOT), parentheses; `authenticated` = signed in; `x.read_all` implies `x.read_own`;
 * unknown names are false (fail closed).
 */
type Node =
  | { kind: 'perm'; name: string }
  | { kind: 'not'; child: Node }
  | { kind: 'and' | 'or'; children: Node[] };

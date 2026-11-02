/** Does the file match an `accept` list ('image/*,.pdf')? */
export function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) {
    return true;
  }
  const name = file.name.toLowerCase();
  return accept.split(',').some((rule) => {
    const r = rule.trim().toLowerCase();
    return r.startsWith('.')
      ? name.endsWith(r)
      : r.endsWith('/*')
        ? file.type.startsWith(r.slice(0, -1))
        : file.type === r;
  });
}

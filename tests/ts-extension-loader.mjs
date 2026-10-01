/**
 * Node's ESM resolver does not add a .ts extension. App imports stay
 * extensionless so the Next bundler can resolve them. This hook is test-only.
 */
export async function resolve(specifier, context, nextResolve) {
  if (
    (specifier.startsWith('./') || specifier.startsWith('../')) &&
    !/\.(?:[cm]?[jt]s|json|node)$/.test(specifier)
  ) {
    return nextResolve(`${specifier}.ts`, context)
  }
  return nextResolve(specifier, context)
}

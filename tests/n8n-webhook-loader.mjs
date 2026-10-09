// Lets node:test import the App Router webhook handler. Next's bundler aliases
// these; the test runner does not.
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'server-only') {
    return {
      shortCircuit: true,
      url: new URL('./server-only-stub.mjs', import.meta.url).href,
    }
  }
  if (specifier.startsWith('@/')) {
    const base = join(root, specifier.slice(2))
    const file = existsSync(`${base}.ts`) ? `${base}.ts` : `${base}.tsx`
    return nextResolve(pathToFileURL(file).href, context)
  }
  try {
    return await nextResolve(specifier, context)
  } catch (error) {
    if (
      error &&
      error.code === 'ERR_MODULE_NOT_FOUND' &&
      !specifier.startsWith('node:') &&
      !specifier.endsWith('.js') &&
      !specifier.endsWith('.mjs')
    ) {
      return nextResolve(`${specifier}.js`, context)
    }
    throw error
  }
}

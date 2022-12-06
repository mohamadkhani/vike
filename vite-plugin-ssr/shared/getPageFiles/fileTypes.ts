export type { FileType }
export { fileTypes }
export { isValidFileType }
export { determineFileType }

import { assert, assertPosixPath, isNpmPackageModule } from '../utils'
import { isScriptFile } from '../../utils/isScriptFile'

const fileTypes = [
  '.page',
  '.page.server',
  '.page.route',
  '.page.client',
  // New type `.page.css`/`.page.server.css`/`.page.client.css` for `extensions[number].pageFileDist`.
  //  - Extensions using `pageFileDist` are expected to use a bundler that generates a `.css` colocated next to the original `.page.js` file (e.g. `/renderer/_default.page.server.css` for `/renderer/_default.page.server.js`.
  //  - Since these `.page.css` files Bundlers We can therefore expect that there isn't any `.page.server.sass`/...
  '.css'
] as const
type FileType = typeof fileTypes[number]

function isValidFileType(filePath: string): boolean {
  return ['.js', '.mjs', '.cjs', '.css'].some((ext) => filePath.endsWith(ext))
}

function determineFileType(filePath: string): FileType {
  assertPosixPath(filePath)

  {
    const isCSS = filePath.endsWith('.css')
    assert(isScriptFile(filePath) || isCSS)
    if (isCSS) {
      assert(isNpmPackageModule(filePath), filePath) // `.css` page files are only supported for npm packages
      return '.css'
    }
  }

  const fileName = filePath.split('/').slice(-1)[0]!
  const fileNameSegments = fileName.split('.')
  const suffix1 = fileNameSegments.slice(-3)[0]
  const suffix2 = fileNameSegments.slice(-2)[0]
  if (suffix2 === 'page') {
    return '.page'
  }
  assert(suffix1 === 'page', { filePath })
  if (suffix2 === 'server') {
    return '.page.server'
  }
  if (suffix2 === 'client') {
    return '.page.client'
  }
  if (suffix2 === 'route') {
    return '.page.route'
  }
  assert(false, { filePath })
}


import { createReadStream } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import next from 'next'

// Hostinger may launch the startup file from a different location than the
// application directory. Next resolves the build from the process working
// directory, so static files must use that same root as well.
const projectRoot = process.cwd()
const serverFileRoot = fileURLToPath(new URL('.', import.meta.url))
const publicRoot = resolve(projectRoot, 'public')
const nextStaticRoot = resolve(projectRoot, '.next/static')
// Hostinger proxies traffic to the process, so bind on every interface.
const hostname = '0.0.0.0'
const port = Number(process.env.PORT || 3000)

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

// Temporary deployment diagnostics: report what the process can actually see on
// disk, since the local build works but the host serves 500s for static files.
async function describeDir(label, dir) {
  try {
    const entries = await readdir(dir)
    return { label, dir, exists: true, entryCount: entries.length, sample: entries.slice(0, 10) }
  } catch (error) {
    return { label, dir, exists: false, errorCode: error?.code ?? null, error: String(error?.message ?? error) }
  }
}

async function describeFile(label, filePath) {
  try {
    const fileStats = await stat(filePath)
    return { label, filePath, exists: true, isFile: fileStats.isFile(), size: fileStats.size, mode: fileStats.mode.toString(8) }
  } catch (error) {
    return { label, filePath, exists: false, errorCode: error?.code ?? null }
  }
}

async function diagnostics() {
  const chunksDir = resolve(nextStaticRoot, 'chunks')
  return {
    cwd: projectRoot,
    serverFileRoot,
    cwdMatchesServerFile: resolve(projectRoot) === resolve(serverFileRoot),
    node: process.version,
    uid: typeof process.getuid === 'function' ? process.getuid() : null,
    port,
    env: {
      NODE_ENV: process.env.NODE_ENV ?? null,
      hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasSupabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    },
    dirs: await Promise.all([
      describeDir('projectRoot', projectRoot),
      describeDir('public', publicRoot),
      describeDir('.next', resolve(projectRoot, '.next')),
      describeDir('.next/static', nextStaticRoot),
      describeDir('.next/static/chunks', chunksDir),
    ]),
    files: await Promise.all([
      describeFile('public/file.svg', resolve(publicRoot, 'file.svg')),
      describeFile('.next/BUILD_ID', resolve(projectRoot, '.next/BUILD_ID')),
    ]),
  }
}

function safeFilePath(root, pathname) {
  const decodedPath = decodeURIComponent(pathname)
  const filePath = resolve(root, decodedPath.replace(/^\/+/, ''))
  const relativePath = relative(root, filePath)

  if (relativePath.startsWith('..') || relativePath.includes('..' + '/') || relativePath.includes('..\\')) {
    return null
  }

  return filePath
}

async function serveStaticFile(request, response, root, pathname) {
  const filePath = safeFilePath(root, pathname)
  if (!filePath) {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Bad Request')
    return true
  }

  try {
    const fileStats = await stat(filePath)
    if (!fileStats.isFile()) return false

    const headers = {
      'Content-Type': contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': fileStats.size,
    }

    if (pathname.startsWith('/_next/static/')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    }

    response.writeHead(200, headers)
    if (request.method === 'HEAD') {
      response.end()
    } else {
      createReadStream(filePath).pipe(response)
    }
    return true
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return false
    throw error
  }
}

const app = next({ dev: false, hostname, port })
const handle = app.getRequestHandler()

await app.prepare()

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
    const { pathname } = requestUrl

    if (pathname === '/__diag') {
      const payload = JSON.stringify(await diagnostics(), null, 2)
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
      response.end(payload)
      return
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      await handle(request, response)
      return
    }

    if (pathname.startsWith('/_next/static/')) {
      const served = await serveStaticFile(request, response, nextStaticRoot, pathname.slice('/_next/static'.length))
      if (served) return
    } else if (!pathname.startsWith('/_next/')) {
      const served = await serveStaticFile(request, response, publicRoot, pathname)
      if (served) return
    }

    await handle(request, response)
  } catch (error) {
    console.error('Request failed', request.method, request.url, error)
    if (!response.headersSent) {
      response.writeHead(500, {
        'Content-Type': 'text/plain; charset=utf-8',
        // Surfaces the failing errno to the outside world while the host issue
        // is being diagnosed.
        'X-Diag-Error': `${error?.code ?? 'UNKNOWN'}:${String(error?.message ?? error).slice(0, 120).replace(/[^\x20-\x7e]/g, ' ')}`,
      })
    }
    response.end('Internal Server Error')
  }
})

server.listen(port, hostname, async () => {
  console.log(`> Ready on http://${hostname}:${port}`)
  console.log('> Diagnostics', JSON.stringify(await diagnostics()))
})

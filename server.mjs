import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import next from 'next'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
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
    console.error('Request failed', error)
    if (!response.headersSent) response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Internal Server Error')
  }
})

server.listen(port, hostname, () => {
  console.log(`> Ready on http://${hostname}:${port}`)
})

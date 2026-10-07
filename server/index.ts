import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { generateDraft } from './openai.ts'

const dev = process.argv.includes('--dev')
const vite = dev ? await (await import('vite')).createServer({ server: { middlewareMode: true } }) : null
const root = resolve('dist')
const mime: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain' }
createServer(async (req, res) => {
  if (req.url?.split('?')[0] === '/api/generate') {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')
    // Same-origin browser requests only; no public CORS proxy.
    if (req.method !== 'POST') { res.writeHead(405).end('{}'); return }
    try {
      if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) { res.writeHead(403).end('{}'); return }
      if (!req.headers['content-type']?.startsWith('application/json')) throw Error('INPUT')
      let body = ''
      for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 100000) throw Error('INPUT') }
      const draft = await generateDraft(JSON.parse(body), process.env.OPENAI_API_KEY || '')
      res.end(JSON.stringify(draft))
    } catch (error) {
      const code = error instanceof Error ? error.message : ''
      const safeCode = ['INPUT', 'CONFIG', 'AUTH', 'QUOTA', 'MODEL', 'REQUEST', 'INCOMPLETE', 'REFUSED', 'INVALID', 'UPSTREAM'].includes(code) ? code : 'UPSTREAM'
      res.writeHead(code === 'INPUT' ? 400 : code === 'CONFIG' ? 503 : 502).end(JSON.stringify({ error: safeCode }))
    }
    return
  }
  if (vite) { vite.middlewares(req, res); return }
  try {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname)
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname))
    if (!file.startsWith(root + '/')) { res.writeHead(403).end(); return }
    const bytes = await readFile(file)
    res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream')
    res.end(bytes)
  } catch { res.writeHead(404).end('Not found') }
}).listen(Number(process.env.PORT || 5173), process.env.HOST || '127.0.0.1', () => console.log('HR-SCORM Studio: http://localhost:' + (process.env.PORT || 5173)))

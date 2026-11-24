import { Hono } from 'hono'

/**
 * API served under /api/*. Static assets and client-side routes never reach
 * this Worker (see `run_worker_first` in wrangler.jsonc).
 * The Worker holds no training logic; see docs/05-architektura.md §4.
 */
const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ ok: true, version: __APP_VERSION__ }))

app.all('/api/*', (c) =>
  c.json({ error: { code: 'not_found', message: 'Unknown API route' } }, 404),
)

export default app

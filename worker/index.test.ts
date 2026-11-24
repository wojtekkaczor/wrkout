import { describe, expect, it } from 'vitest'
import app from './index'

describe('API', () => {
  it('reports health with the app version', async () => {
    const response = await app.request('/api/health')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, version: 'test' })
  })

  it('answers unknown API routes with a JSON error', async () => {
    const response = await app.request('/api/does-not-exist')

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      error: { code: 'not_found', message: 'Unknown API route' },
    })
  })
})

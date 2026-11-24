import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// Unit tests run in plain Node with an in-memory IndexedDB. The Cloudflare and
// PWA plugins from vite.config.ts are deliberately left out.
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('test'),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'worker/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
  },
})

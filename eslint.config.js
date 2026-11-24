import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/*
 * Module boundaries from docs/05-architektura.md §4:
 *
 *   features → ui, data, engine      data, engine, catalog → domain
 *   engine → domain, catalog only    worker → domain only
 *
 * A later `no-restricted-imports` entry replaces an earlier one for the same
 * file, so every layer lists its full set of restrictions through `layer()`.
 */
const CROSS_MODULE_RELATIVE = {
  group: ['../../*'],
  message: 'Use the @/ alias to import across modules.',
}

function layer(files, { modules = [], packages = [], reason }) {
  const patterns = [CROSS_MODULE_RELATIVE]
  if (modules.length > 0) {
    patterns.push({ group: modules, message: reason })
  }
  if (packages.length > 0) {
    patterns.push({ group: packages, message: reason })
  }
  return { files, rules: { 'no-restricted-imports': ['error', { patterns }] } }
}

const UI_PACKAGES = ['react', 'react-dom', 'react-dom/*', 'react-router']
const STORAGE_PACKAGES = ['dexie', 'dexie-react-hooks']

export default tseslint.config(
  {
    ignores: [
      'dist',
      'dev-dist',
      '.wrangler',
      'node_modules',
      'playwright-report',
      'test-results',
      'worker-configuration.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs['recommended-latest'].rules,
  },
  {
    files: ['*.config.{js,ts}', 'tests/**/*.ts', 'scripts/**/*.{js,ts}'],
    languageOptions: { globals: globals.node },
  },

  layer(['src/**/*.{ts,tsx}'], {}),
  layer(['src/domain/**/*.ts'], {
    modules: ['@/*', '!@/domain', '!@/domain/**'],
    packages: [...UI_PACKAGES, ...STORAGE_PACKAGES, 'hono', 'hono/*'],
    reason: 'domain holds shared types and schemas only; it imports nothing from the project.',
  }),
  layer(['src/catalog/**/*.ts'], {
    modules: ['@/*', '!@/domain', '!@/domain/**', '!@/catalog', '!@/catalog/**'],
    packages: [...UI_PACKAGES, ...STORAGE_PACKAGES, 'hono', 'hono/*'],
    reason: 'catalog is static data; it may import only domain.',
  }),
  layer(['src/engine/**/*.ts'], {
    modules: [
      '@/*',
      '!@/domain',
      '!@/domain/**',
      '!@/catalog',
      '!@/catalog/**',
      '!@/engine',
      '!@/engine/**',
    ],
    packages: [...UI_PACKAGES, ...STORAGE_PACKAGES, 'hono', 'hono/*'],
    reason: 'engine is pure logic; it may import only domain and catalog.',
  }),
  {
    // The engine is deterministic: the current time is always passed in.
    files: ['src/engine/**/*.ts'],
    ignores: ['src/engine/**/*.test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: 'The engine takes "now" as a parameter; do not read the system clock.',
        },
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: 'The engine takes "now" as a parameter; do not read the system clock.',
        },
      ],
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'navigator',
        'fetch',
        'localStorage',
        'indexedDB',
      ],
    },
  },
  layer(['src/data/**/*.ts'], {
    modules: ['@/features', '@/features/**', '@/app', '@/app/**', '@/ui', '@/ui/**'],
    reason: 'data may import only domain, catalog and engine.',
  }),
  layer(['src/ui/**/*.{ts,tsx}'], {
    modules: [
      '@/features',
      '@/features/**',
      '@/app',
      '@/app/**',
      '@/data',
      '@/data/**',
      '@/engine',
      '@/engine/**',
    ],
    packages: STORAGE_PACKAGES,
    reason: 'ui holds presentational components; it knows nothing about data or features.',
  }),
  layer(['src/features/**/*.{ts,tsx}'], {
    modules: ['@/app', '@/app/**'],
    packages: STORAGE_PACKAGES,
    reason: 'features reach storage through @/data and never depend on the app shell.',
  }),
  layer(['worker/**/*.ts'], {
    modules: ['@/*', '!@/domain', '!@/domain/**'],
    packages: [...UI_PACKAGES, ...STORAGE_PACKAGES],
    reason: 'the worker holds no training logic; it may import only domain.',
  }),
)

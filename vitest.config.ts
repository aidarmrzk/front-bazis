import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: { alias: { '~': resolve(import.meta.dirname, 'app') } },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['app/lib/**/*.ts', 'app/stores/**/*.ts'],
      reporter: ['text', 'html'],
      thresholds: { lines: 85, functions: 85, branches: 75, statements: 85 },
    },
  },
})

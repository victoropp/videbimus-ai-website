/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['src/test/api-setup.ts'],
    include: [
      'src/app/api/**/*.{test,spec}.{js,ts}',
    ],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/app/api/**/*.{js,ts}'],
      exclude: [
        '**/*.d.ts',
        '**/*.config.*',
        'src/test/**'
      ]
    },
    testTimeout: 15000, // Longer timeout for API tests
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': process.env,
  },
})
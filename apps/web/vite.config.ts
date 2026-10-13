import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    fileParallelism: false,
    globals: true,
    setupFiles: './src/test/setup.ts',
    testTimeout: 15_000,
  },
})

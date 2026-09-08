/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    host: true,
    port: 43217,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 43217,
    strictPort: true,
  },
})

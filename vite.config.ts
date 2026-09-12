/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const arcSha = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || '').slice(0, 7)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_ARC_SHA': JSON.stringify(arcSha),
  },
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

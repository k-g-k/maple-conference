import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // The app lives in app/ so the repo root stays readable. Vite serves from
  // there; the build still lands in dist/ at the root, where Vercel looks.
  root: 'app',
  build: { outDir: '../dist', emptyOutDir: true },
  plugins: [react(), tailwindcss()],
})

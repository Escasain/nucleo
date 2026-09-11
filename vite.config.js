import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path = nombre del repo, para GitHub Pages (https://escasain.github.io/nucleo/)
export default defineConfig({
  plugins: [react()],
  base: '/nucleo/',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})

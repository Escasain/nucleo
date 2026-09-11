import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base relativa: los assets se piden respecto al propio index.html, así
// que la app sirve igual en la raíz de un dominio (Vercel, Netlify) que
// en un subdirectorio (GitHub Pages, https://escasain.github.io/nucleo/).
// El enrutado es por hash, así que no hace falta configurar el servidor.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})

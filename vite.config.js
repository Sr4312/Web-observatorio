import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': resolve(__dirname, './src') } },
  // Artefactos de Playwright MCP (capturas/descargas): si Vite los vigila,
  // crashea con EBUSY y fuerza recargas durante las verificaciones.
  server: { watch: { ignored: ['**/.playwright-mcp/**'] } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'router':        ['react-router-dom'],
          'framer-motion': ['framer-motion'],
          'chart':         ['chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
})

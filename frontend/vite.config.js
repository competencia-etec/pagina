import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, ''),
      },
      '/user': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/wordle': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/maze': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
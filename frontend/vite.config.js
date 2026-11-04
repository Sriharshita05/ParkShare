import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Future backend: proxy API calls during development
    // proxy: { '/api': 'http://localhost:5000' },
  },
})

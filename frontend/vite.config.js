import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all interfaces
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'cloudnotes.duckdns.org',
      '.duckdns.org',  // Allow all duckdns subdomains
      'localhost',
      '13.51.227.34'
    ],
    hmr: {
      clientPort: 5173
    },
    proxy: {
      '/api': {
        target: 'http://backend:5000', // Use the service name from docker-compose
        changeOrigin: true
      }
    }
  }
})
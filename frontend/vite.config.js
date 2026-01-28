import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Required for docker
    port: 5173,
    allowedHosts: ['all'], // Allow all domains including DuckDNS
    proxy: {
      '/api': {
        target: 'http://backend:5000', // Use the service name from docker-compose
        changeOrigin: true
      }
    }
  }
})
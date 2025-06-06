import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    // Prevenir que se eliminen estilos condicionales en producción
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // Mantener condicionales para dark mode
        dead_code: false,
        conditionals: false,
      },
    },
  },
  // Asegurar que los estilos inline se mantengan
  esbuild: {
    keepNames: true,
  }
})

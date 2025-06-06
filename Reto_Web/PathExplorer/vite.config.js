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
    minify: 'esbuild',
    // Configuración para esbuild para mantener el código de dark mode
    esbuildOptions: {
      drop: ['console', 'debugger'],
      // Mantener el código para dark mode
      treeShaking: true,
      pure: [],
    },
  },
  // Asegurar que los estilos inline se mantengan
  esbuild: {
    keepNames: true,
  }
})

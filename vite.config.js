import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group heavy libraries into their own chunks
            if (id.includes('recharts') || id.includes('d3')) return 'charts';
            if (id.includes('framer-motion')) return 'animations';
            if (id.includes('jspdf') || id.includes('xlsx')) return 'documents';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'framework';
            
            // Standard vendor chunk for other node_modules
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit as we are now splitting properly
  },
})

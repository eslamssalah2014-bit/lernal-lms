import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose both standard VITE_ and Vercel/Next-style NEXT_PUBLIC_ variables
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || process.env.BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import PinyVite from '@pinegrow/piny-vite';

export default defineConfig({
  plugins: [react(), PinyVite()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      external: ['react-syntax-highlighter', 'react-syntax-highlighter/dist/esm/styles/prism'],
    },
  },
});
// https://vitejs.dev/config/

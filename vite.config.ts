import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import PinyVite from '@pinegrow/piny-vite';

export default defineConfig({
  plugins: [react() as any, PinyVite() as any],
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api/proxy/deepl': {
        target: 'https://api.deepl.com/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy\/deepl/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Securely inject DeepL API key from env
            const apiKey = process.env.VITE_DEEPL_API_KEY;
            if (apiKey) {

              proxyReq.setHeader('Authorization', `DeepL-Auth-Key ${apiKey}`);
            }
          });
        },
      },
    },
  },
  build: {
    rollupOptions: {
      external: ['react-syntax-highlighter', 'react-syntax-highlighter/dist/esm/styles/prism'],
    },
  },
});
// https://vitejs.dev/config/

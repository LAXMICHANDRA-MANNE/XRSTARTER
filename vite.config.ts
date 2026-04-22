import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/XRSTARTER/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/status': 'http://127.0.0.1:5000',
      '/video_feed': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/upload': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/api': 'http://127.0.0.1:5000',
      '/start_camera': 'http://127.0.0.1:5000',
      '/stop_camera': 'http://127.0.0.1:5000'
    },
    watch: {
      ignored: ['**/lpro/**', '**/server/**']
    }
  },
  build: {
    rollupOptions: {
      external: [/^lpro\/.*/, /^server\/.*/]
    }
  }
}));

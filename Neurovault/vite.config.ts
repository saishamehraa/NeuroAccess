import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/neurovault/', // always serve at /neurovault/
  server: {
    host: '0.0.0.0',
    port: 3001,
    open: '/neurovault/' // auto-open correct path in browser
  },
  preview: {
    port: 3001,
    open: '/neurovault/' // also open correct path when using vite preview
  },
  plugins: [
    react(),
    tailwindcss()
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

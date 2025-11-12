import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: isProd ? '/neuropromptgallery/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  server: {
    port: 3002,
   // open: '/neuropromptgallery/',
  },
  preview: {
    port: 3002,
    //open: '/neuropromptgallery/',
  },
  envDir: '.',
});

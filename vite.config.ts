import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',  // <-- Root app served at /
  plugins: [react()],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
})

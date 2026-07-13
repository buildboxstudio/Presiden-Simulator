import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Presiden-Simulator/',
  plugins: [react()],
  build: {
    sourcemap: false,
    cssMinify: true,
  },
})

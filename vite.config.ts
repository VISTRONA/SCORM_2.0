import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deploy the built static application at the origin root over HTTPS.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})

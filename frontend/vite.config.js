import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Get rid of the CORS Errors
  server:{
    port:3000,
    proxy:{
      '/api': {
        target:'http://localhost:8000',
        secure: false,
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss()],
  preview: {
    // Necesario para que "vite preview" acepte el dominio dinámico que
    // asigna Railway (u otras plataformas) al desplegar el frontend.
    host: true,
    allowedHosts: true,
  },
})

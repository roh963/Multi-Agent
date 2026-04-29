import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  preview: {
    port: 7860,      // HuggingFace Space default port
    host: '0.0.0.0', // HF Space ke liye zaroori hai
  },
})
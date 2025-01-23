import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import MillionLint from '@million/lint';

export default defineConfig({
  plugins: [MillionLint.vite(), react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  }
})
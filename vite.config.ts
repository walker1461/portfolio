import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  base: './',
  plugins: [tailwindcss(), cloudflare()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'src/about.html',
        projects: 'src/projects.html',
        contact: 'src/contact.html'
      }
    }
  }
})
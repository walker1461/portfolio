import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
  ],
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

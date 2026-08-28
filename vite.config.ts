import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// base: './' + viteSingleFile inline the JS/CSS into one self-contained
// dist/index.html, so it can be opened directly (file://) from anywhere —
// USB key, shared drive, email attachment — with no server and no install.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    chunkSizeWarningLimit: 3000,
  },
})

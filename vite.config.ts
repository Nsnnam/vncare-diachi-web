import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ensure relative paths for GitHub Pages and offline opening
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 5000,
  }
});

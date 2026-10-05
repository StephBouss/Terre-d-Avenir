import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@global': fileURLToPath(new URL('./src/global', import.meta.url)),
      '@screens': fileURLToPath(new URL('./src/screens', import.meta.url)),
    },
  },
});

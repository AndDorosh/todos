import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path, { resolve } from "path";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, "src/app/index.tsx"),
    },
  },
})

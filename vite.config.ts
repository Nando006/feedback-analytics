import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      layouts: path.resolve(__dirname, './layouts'),
      pages: path.resolve(__dirname, './pages'),
      server: path.resolve(__dirname, './src/server'),
      lib: path.resolve(__dirname, './lib'),
      components: path.resolve(__dirname, './components'),
      styles: path.resolve(__dirname, './styles'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  test: {
    globals: true, // Permite usar `describe`, `it`, `expect` sem precisar importar
    environment: 'jsdom', // Simula um ambiente de navegador (DOM) para testes de componentes React
  },
});

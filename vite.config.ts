import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      layouts: path.resolve(__dirname, './src/layouts'),
      pages: path.resolve(__dirname, './src/pages'),
      server: path.resolve(__dirname, './server'),
      lib: path.resolve(__dirname, './lib'),
      components: path.resolve(__dirname, './components'),
      styles: path.resolve(__dirname, './styles'),
    },
  },
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { existsSync } from 'fs';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'child_process';

function getGitVersionTag(): string {
  try {
    return execSync('git describe --tags --abbrev=0', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return 'dev';
  }
}

const gitVersion = getGitVersionTag();

function resolveSharedPath(): string {
  const candidates = [
    path.resolve(__dirname, '../../shared'),
    path.resolve(__dirname, './shared'),
    path.resolve(process.cwd(), 'shared'),
    path.resolve(process.cwd(), '../../shared'),
  ];

  const found = candidates.find((candidate) => existsSync(candidate));

  return found ?? path.resolve(__dirname, '../../shared');
}

const sharedPath = resolveSharedPath();

// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(gitVersion),
  },
  build: {
    outDir: path.resolve(__dirname, './dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      // Shared schemas are imported from ../../shared; force zod to resolve from web deps.
      zod: path.resolve(__dirname, './node_modules/zod'),
      src: path.resolve(__dirname, './src'),
      layouts: path.resolve(__dirname, './layouts'),
      pages: path.resolve(__dirname, './pages'),
      server: path.resolve(__dirname, '../../backends/api-gateway'),
      lib: sharedPath,
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
    setupFiles: [path.resolve(__dirname, './tests/setup.ts')],
  },
});

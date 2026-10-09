/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': { target: 'http://localhost:4300', changeOrigin: true },
    },
  },

  preview: {
    port: 3300,
    host: '0.0.0.0',
  },

  plugins: [react(), tsconfigPaths()],

  build: {
    outDir: 'dist',
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          state: ['@reduxjs/toolkit', 'react-redux'],
          mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: 'src/coverage',
      provider: 'v8',
    },
  },
});

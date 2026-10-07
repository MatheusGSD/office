import { defineConfig } from 'vite';

// base relativa: funciona tanto em https://<user>.github.io/<repo>/ quanto em domínio próprio
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
  },
});

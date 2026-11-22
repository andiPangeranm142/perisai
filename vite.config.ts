import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages project site: https://andiPangeranm142.github.io/perisai/
export default defineConfig({
  plugins: [react()],
  base: '/perisai/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});

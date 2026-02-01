import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  // Development server config
  server: {
    port: 3000,
    open: true,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NegarityColorVisualizer',
      formats: ['es', 'umd'],
      fileName: (format) => `negarity-color-visualizer.${format}.js`,
    },
    rollupOptions: {
      // Externalize dependencies that should not be bundled
      external: [],
      output: {
        // Provide global variables for UMD build
        globals: {},
      },
    },
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});

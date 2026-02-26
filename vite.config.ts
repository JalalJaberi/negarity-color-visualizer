import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { copyFileSync, existsSync } from 'fs';

// Copy images to dist (next to UMD) so getAssetBaseUrl() can resolve them
function copyAssetsPlugin() {
  return {
    name: 'copy-assets',
    closeBundle() {
      const dist = resolve(__dirname, 'dist');
      const src = resolve(__dirname, 'src/assets/images');
      ['circle.png', 'horseshoe.png'].forEach((file) => {
        const from = resolve(src, file);
        const to = resolve(dist, file);
        if (existsSync(from)) {
          copyFileSync(from, to);
        }
      });
    },
  };
}

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
    copyAssetsPlugin(),
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

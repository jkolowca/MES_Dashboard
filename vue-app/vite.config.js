import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import path from 'path';
import prefixer from 'postcss-prefix-selector';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      name: 'VueWebComponents',
      fileName: 'web-components',
      formats: ['iife']
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production')
    }
  },
  css: {
    postcss: {
      plugins: [
        prefixer({
          prefix: 'hello-vue',
          transform(prefix, selector, prefixedSelector, filePath) {
            if (selector.startsWith('hello-vue')) {
              return selector;
            }
            if (selector === 'body' || selector === 'html') {
              return 'hello-vue';
            }
            if (selector.startsWith(':root')) {
              return selector.replace(':root', 'hello-vue');
            }
            return prefixedSelector;
          }
        })
      ]
    }
  }
});

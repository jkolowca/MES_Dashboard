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
          prefix: 'vue-alarms-widget',
          transform(prefix, selector, prefixedSelector, filePath) {
            // Scope dark theme to .app-dark, and light theme to everything else
            const isDark = filePath?.includes('dark');
            const scope = isDark ? '.app-dark vue-alarms-widget' : 'html:not(.app-dark) vue-alarms-widget';
            
            if (selector === 'body' || selector === 'html') return scope;
            if (selector.startsWith(':root')) return selector.replace(':root', scope);
            return prefixedSelector.replace(prefix, scope);
          }
        })
      ]
    }
  }
});

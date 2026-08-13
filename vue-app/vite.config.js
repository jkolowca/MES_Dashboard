import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import path from 'path';
import prefixer from 'postcss-prefix-selector';

export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      name: 'VueWebComponents',
      fileName: 'web-components',
      formats: ['iife']
    }
  },
  css: {
    postcss: {
      plugins: [
        prefixer({
          prefix: 'vue-alarms-widget',
          transform(prefix, selector, prefixedSelector, filePath) {
            // Only restrict theme stylesheets to their respective light/dark selectors
            const isTheme = filePath?.includes('themes/');
            let scope = 'vue-alarms-widget';
            
            if (isTheme) {
              const isDark = filePath?.includes('dark');
              scope = isDark ? '.app-dark vue-alarms-widget' : 'html:not(.app-dark) vue-alarms-widget';
            }
            
            if (selector === 'body' || selector === 'html') return scope;
            if (selector.startsWith(':root')) return selector.replace(':root', scope);
            return prefixedSelector.replace(prefix, scope);
          }
        })
      ]
    }
  }
});

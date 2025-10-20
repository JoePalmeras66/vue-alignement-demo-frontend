import { URL, fileURLToPath } from 'node:url'

import * as path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'

import { viteStaticCopy } from 'vite-plugin-static-copy'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base: env.VITE_APP_BASE_PATH,
    server: {
      port: 5000,
      cors: true,
      proxy: {
        '^/wm/.*': {
          target: 'http://localhost:39201',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/wm/, '/ui-api/v1'),
        },
        '^/pcots/v1/WS001/.*': {
          target: 'http://localhost:39201',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/pcots\/v1\/WS001/, '/ui-api/v1'),
        },
        '^/pcots/.*': {
          target: 'http://localhost:39201',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/pcots/, '/ui-api'),
        },
        '^/Core/.*': {
          target: 'ws://localhost:39201',
          ws: true,
          rewriteWsOrigin: true,
          rewrite: (path) => path.replace(/^\/Core/, '/Core'),
        },
        '^/Pcots/v1/\\d/PcotsEvents': {
          target: 'ws://localhost:39201',
          ws: true,
          rewriteWsOrigin: true,
          rewrite: (path) => path.replace(/^\/Pcots\/v1\/\d/, '/ui-api/v1'),
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
    plugins: [
      vue({
        script: {
          defineModel: true,
        },
      }),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          'vue-i18n',
          'vue/macros',
          '@vueuse/core',
        ],
        dts: 'src/auto-imports.d.ts',
        dirs: ['src/composables', 'src/store', 'src/types'],
        vueTemplate: true,
      }),
      Components({
        // allow auto load markdown components under `./src/components/`
        extensions: ['vue'],
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/],
        dts: 'src/components.d.ts',
      }),
      VueI18nPlugin({
        include: [path.resolve(__dirname, './src/locales/**')],
      }),
      viteStaticCopy({
        targets: [
          {
            src: 'src/assets/*',
            dest: 'src/assets',
          },
        ],
      }),
    ],
    resolve: {
      // Default is ['browser', 'module', 'jsnext:main', 'jsnext'] -> switched browser and module because of failing devexpress tests
      mainFields: ['module', 'browser', 'jsnext:main', 'jsnext'],
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      include: ['**/*.spec.ts'],
      globals: true,
      environment: 'jsdom',
      watch: false,
      server: {
        deps: {
          inline: [
            '@vue',
            '@vueuse',
            '@tgw-components/core',
            '@tgw-components/web',
            'element-plus',
            'vue-router',
          ],
        },
      },
      // configure sonarqube vite test reporter
      reporters: ['verbose', 'vitest-sonar-reporter'],
      outputFile: 'sonar-report.xml',
      coverage: {
        reporter: ['lcov'],
      },
      setupFiles: ['vitest.setup.ts'],
    },
    build: {
      target: 'esnext',
    },
  }
})

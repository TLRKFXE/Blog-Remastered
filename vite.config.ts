import fs from 'node:fs'
import { resolve } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Markdown from 'unplugin-vue-markdown/vite'
import VueRouter from 'unplugin-vue-router/vite'
import Shiki from '@shikijs/markdown-it'
import anchor from 'markdown-it-anchor'
import linkAttributes from 'markdown-it-link-attributes'
import matter from 'gray-matter'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
  const enableShiki = command === 'build' || process.env.VITE_DEV_SHIKI === '1'

  return {
  resolve: {
    alias: {
      '~/': `${resolve(__dirname, 'src')}/`,
    },
  },

  plugins: [
    VueRouter({
      extensions: ['.vue', '.md'],
      routesFolder: 'pages',
      exclude: ['**/posts/*.md'],
      dts: 'src/typed-router.d.ts',
      extendRoute(route) {
        const path = route.component
        if (path && path.endsWith('.md')) {
          route.addToMeta({
            frontmatter: getFrontmatter(path),
          })
        }
      },
    }),

    Vue({
      include: [/\.vue$/, /\.md$/],
    }),

    Markdown({
      wrapperClasses: 'prose slide-enter-content',
      headEnabled: true,
      async markdownItSetup(md) {
        if (enableShiki) {
          md.use(await Shiki({
            defaultColor: false,
            themes: {
              light: 'vitesse-light',
              dark: 'vitesse-dark',
            },
          }))
        }
        md.use(anchor, {
          permalink: anchor.permalink.linkInsideHeader({
            symbol: '#',
            renderAttrs: () => ({ 'aria-hidden': 'true' }),
          }),
        })
        md.use(linkAttributes, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })
      },
    }),

    UnoCSS(),

    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
      ],
      dts: 'src/auto-imports.d.ts',
    }),

    Components({
      extensions: ['vue', 'md'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        IconsResolver({
          prefix: 'i',
        }),
      ],
      dts: 'src/components.d.ts',
    }),

    Icons({
      scale: 1.2,
      defaultStyle: 'display:inline-block;vertical-align:middle;',
    }),
  ],
}
})

function getFrontmatter(path: string) {
  try {
    const content = fs.readFileSync(path, 'utf-8')
    const { data } = matter(content)
    return data
  }
  catch {
    return {}
  }
}

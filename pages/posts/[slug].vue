<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import linkAttributes from 'markdown-it-link-attributes'
import { supabase } from '~/lib/supabase'
import { formatDate } from '~/composables'

interface RemotePostDetail {
  slug: string
  title: string
  description: string | null
  content_md: string
  cover_url: string | null
  category: string | null
  published_at: string | null
  created_at: string
}

interface GalleryItem {
  url: string
  caption?: string
}

const route = useRoute('/posts/[slug]')
const router = useRouter()

const CATEGORY_LABELS = {
  code: 'Code',
  life: 'Life',
  game: 'Game',
  idea: 'Idea',
} as const

const loading = ref(true)
const post = ref<RemotePostDetail | null>(null)
const lightboxImage = ref<string | null>(null)
const articleRef = ref<HTMLElement | null>(null)
const galleryCleanupFns: Array<() => void> = []

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

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

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function parseGalleryLines(content: string) {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [urlPart, ...captionParts] = line.split('|')
      const url = (urlPart || '').trim()
      const caption = captionParts.join('|').trim()
      return {
        url,
        caption,
      } satisfies GalleryItem
    })
    .filter(item => /^https?:\/\//.test(item.url))
}

function buildGalleryHtml(items: GalleryItem[]) {
  if (!items.length)
    return ''

  const cards = items.map((item) => {
    const caption = item.caption ? `<figcaption>${md.renderInline(item.caption)}</figcaption>` : ''
    return `
      <figure class="gallery-card">
        <img
          src="${escapeHtml(item.url)}"
          alt="gallery image"
          data-lightbox="true"
          class="body-image gallery-image"
          loading="lazy"
        />
        ${caption}
      </figure>
    `
  }).join('')

  return `<div class="gallery-scroll">${cards}</div>`
}

function enhanceContentImages(html: string) {
  return html.replace(/<img\s+/g, '<img data-lightbox="true" class="body-image" loading="lazy" ')
}

function parseCenterBlocks(markdown: string) {
  const centerRegex = /\[center\]([\s\S]*?)\[\/center\]/g
  const centerPlaceholders: string[] = []

  const transformed = markdown.replace(centerRegex, (_, content: string) => {
    const marker = `@@CENTER_${centerPlaceholders.length}@@`
    const inner = content.trim()
    const renderedInner = inner ? md.render(inner) : ''
    centerPlaceholders.push(`<div class="md-center">${renderedInner}</div>`)
    return marker
  })

  return {
    transformed,
    centerPlaceholders,
  }
}

function renderWithGalleries(markdown: string) {
  const galleryRegex = /\[gallery-scroll\]([\s\S]*?)\[\/gallery-scroll\]/g
  const placeholders: string[] = []

  const galleryTransformed = markdown.replace(galleryRegex, (_, content: string) => {
    const items = parseGalleryLines(content)
    const marker = `@@GALLERY_${placeholders.length}@@`
    placeholders.push(buildGalleryHtml(items))
    return marker
  })

  const { transformed, centerPlaceholders } = parseCenterBlocks(galleryTransformed)

  let html = enhanceContentImages(md.render(transformed))

  placeholders.forEach((galleryHtml, index) => {
    html = html.replace(`@@GALLERY_${index}@@`, galleryHtml)
  })

  centerPlaceholders.forEach((centerHtml, index) => {
    html = html.replace(`@@CENTER_${index}@@`, centerHtml)
  })

  return html
}

const htmlContent = computed(() => {
  if (!post.value)
    return ''

  return renderWithGalleries(post.value.content_md)
})

const publishDate = computed(() => {
  if (!post.value)
    return ''

  return formatDate(post.value.published_at || post.value.created_at)
})

const category = computed<'code' | 'life' | 'game' | 'idea'>(() => {
  const value = post.value?.category?.toLowerCase().trim()
  if (value === 'code' || value === 'life' || value === 'game' || value === 'idea')
    return value

  return 'idea'
})

const categoryLabel = computed(() => CATEGORY_LABELS[category.value])

useHead(() => {
  if (!post.value) {
    return {
      title: 'Post',
      meta: [
        {
          name: 'description',
          content: 'A blog post',
        },
      ],
    }
  }

  return {
    title: post.value.title,
    meta: [
      {
        name: 'description',
        content: post.value.description || '',
      },
    ],
  }
})

function onArticleClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target)
    return

  const image = target.closest('img[data-lightbox="true"]') as HTMLImageElement | null
  if (!image)
    return

  event.preventDefault()
  lightboxImage.value = image.currentSrc || image.src
}

function cleanupGalleryInteractions() {
  while (galleryCleanupFns.length) {
    const cleanup = galleryCleanupFns.pop()
    cleanup?.()
  }
}

function setupGalleryInteractions() {
  cleanupGalleryInteractions()

  const root = articleRef.value
  if (!root)
    return

  const prose = root.querySelector<HTMLElement>('.prose')

  const syncGalleryBounds = (gallery: HTMLElement) => {
    const proseRect = prose?.getBoundingClientRect()

    if (!proseRect) {
      gallery.style.setProperty('--gallery-left-pad', '1rem')
      gallery.style.setProperty('--gallery-right-pad', '1rem')
      return
    }

    const leftPad = Math.max(0, proseRect.left)
    const rightPad = Math.max(0, window.innerWidth - proseRect.right)

    gallery.style.setProperty('--gallery-left-pad', `${leftPad}px`)
    gallery.style.setProperty('--gallery-right-pad', `${rightPad}px`)

    const maxScrollLeft = gallery.scrollWidth - gallery.clientWidth
    if (maxScrollLeft <= 0)
      return

    gallery.scrollLeft = Math.max(0, Math.min(maxScrollLeft, gallery.scrollLeft))
  }

  const galleries = root.querySelectorAll<HTMLElement>('.gallery-scroll')

  galleries.forEach((gallery) => {
    gallery.style.scrollBehavior = 'auto'
    gallery.style.scrollSnapType = 'none'

    const normalizeWheelDelta = (event: WheelEvent) => {
      const hasVerticalDelta = Math.abs(event.deltaY) > 0.01
      const delta = hasVerticalDelta ? event.deltaY : event.deltaX

      if (!delta)
        return 0

      if (event.deltaMode === 1)
        return delta * 16

      if (event.deltaMode === 2)
        return delta * gallery.clientHeight

      return delta
    }

    const resetToStart = () => {
      syncGalleryBounds(gallery)
      gallery.scrollLeft = 0
    }

    requestAnimationFrame(resetToStart)

    const onResize = () => {
      syncGalleryBounds(gallery)
    }

    window.addEventListener('resize', onResize, { passive: true })

    const images = gallery.querySelectorAll<HTMLImageElement>('img')
    images.forEach((image) => {
      if (image.complete)
        return

      image.addEventListener('load', resetToStart, { once: true })
      galleryCleanupFns.push(() => image.removeEventListener('load', resetToStart))
    })

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey)
        return

      const maxScrollLeft = gallery.scrollWidth - gallery.clientWidth
      if (maxScrollLeft <= 0)
        return

      const normalized = normalizeWheelDelta(event)
      if (!normalized)
        return

      const currentScrollLeft = gallery.scrollLeft
      const scaledDelta = normalized * 1.45
      const next = Math.max(0, Math.min(maxScrollLeft, currentScrollLeft + scaledDelta))
      const moved = Math.abs(next - currentScrollLeft) > 0.01

      if (!moved)
        return

      event.preventDefault()
      gallery.scrollLeft = next
    }

    gallery.addEventListener('wheel', onWheel, { passive: false })

    galleryCleanupFns.push(() => {
      window.removeEventListener('resize', onResize)
      gallery.removeEventListener('wheel', onWheel)
      gallery.style.scrollSnapType = 'none'
    })
  })
}

function closeLightbox() {
  lightboxImage.value = null
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/blog')
}

async function loadRemotePost() {
  const hasSupabaseEnv
    = !!import.meta.env.VITE_SUPABASE_URL
    && !!import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!hasSupabaseEnv) {
    post.value = null
    loading.value = false
    return
  }

  const slug = route.params.slug
  if (!slug) {
    post.value = null
    loading.value = false
    return
  }

  const { data, error } = await supabase
    .from('posts')
    .select('slug, title, description, content_md, cover_url, category, published_at, created_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !data) {
    post.value = null
    loading.value = false
    return
  }

  post.value = data
  loading.value = false
}

onMounted(async () => {
  await loadRemotePost()
})

watch(htmlContent, async () => {
  await nextTick()
  setupGalleryInteractions()
})

onBeforeUnmount(() => {
  cleanupGalleryInteractions()
})
</script>

<template>
  <div class="slide-enter-content">
    <div v-if="loading" class="py-12 text-sm opacity-60">
      Loading post...
    </div>

    <div v-else-if="!post" class="py-12">
      <h1 class="text-2xl font-600 mb-3">Post Not Found</h1>
      <RouterLink
        to="/blog"
        class="text-sm font-mono opacity-50 hover:opacity-80 transition-opacity no-underline"
      >
        cd /blog
      </RouterLink>
    </div>

    <article ref="articleRef" v-else class="post-article" @click="onArticleClick">
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-600 leading-tight mb-2 tracking-tight">
          {{ post.title }}
        </h1>
        <p v-if="post.description" class="text-secondary mt-0 mb-3">
          {{ post.description }}
        </p>
        <div class="flex items-center gap-2.5">
          <span class="post-category-badge" :class="`post-category-badge--${category}`">
            {{ categoryLabel }}
          </span>
          <time class="text-sm text-secondary font-mono">{{ publishDate }}</time>
        </div>
      </div>

      <img
        v-if="post.cover_url"
        :src="post.cover_url"
        :alt="post.title"
        data-lightbox="true"
        class="cover-image w-full rounded-xl mb-8 border border-base cursor-zoom-in"
      >

      <div class="prose" v-html="htmlContent" />

      <div class="mt-16 mb-4">
        <button
          class="text-sm font-mono opacity-40 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none text-base p-0"
          @click="goBack"
        >
          cd ..
        </button>
      </div>
    </article>

    <Transition name="fade">
      <div
        v-if="lightboxImage"
        class="lightbox"
        @click="closeLightbox"
      >
        <img
          :src="lightboxImage"
          alt="preview"
          class="lightbox-image"
        >
      </div>
    </Transition>
  </div>
</template>

<style scoped>
:deep(.prose img.body-image) {
  max-width: 100%;
  width: auto;
  height: auto;
  aspect-ratio: auto;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid var(--c-border);
  margin: 1.2rem 0;
  cursor: zoom-in;
  display: inline-block;
}

:deep(.prose),
:deep(.prose p),
:deep(.prose li),
:deep(.prose blockquote),
:deep(.prose td),
:deep(.prose th),
:deep(.prose a),
:deep(.prose code) {
  overflow-wrap: anywhere;
  word-break: break-word;
}

:deep(.prose pre),
:deep(.prose pre code) {
  overflow-wrap: normal;
  word-break: normal;
}

:deep(.prose .md-center) {
  text-align: center;
  margin: 1rem 0;
}

:deep(.prose .md-center > *:last-child) {
  margin-bottom: 0;
}

:deep(.prose .gallery-scroll) {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.25rem 0 0.6rem;
  margin: 1.1rem 0 1.2rem;
  scroll-snap-type: x proximity;
  width: 100vw;
  max-width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  padding-left: var(--gallery-left-pad, 1rem);
  padding-right: var(--gallery-right-pad, 1rem);
  box-sizing: border-box;
  scroll-padding-left: var(--gallery-left-pad, 1rem);
  scroll-padding-right: var(--gallery-right-pad, 1rem);
  overscroll-behavior-x: contain;
  touch-action: pan-y;
  cursor: default;
}

:deep(.prose .gallery-card) {
  flex: 0 0 auto;
  width: min(78vw, 420px);
  margin: 0;
}

:deep(.prose .gallery-card .gallery-image) {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--c-border);
  margin: 0;
  scroll-snap-align: start;
}

:deep(.prose .gallery-card figcaption) {
  margin-top: 0.45rem;
  font-size: 0.92rem;
  color: var(--c-text-light);
}

:deep(.prose .gallery-scroll::-webkit-scrollbar) {
  height: 6px;
}

:deep(.prose .gallery-scroll::-webkit-scrollbar-thumb) {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

.cover-image {
  cursor: zoom-in;
}

.post-category-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3rem;
  border-radius: 9999px;
  border: 1px solid var(--c-border);
  padding: 0.15rem 0.58rem;
  font-size: 0.67rem;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1.2;
  opacity: 0.9;
}

.post-category-badge--code {
  border-color: rgba(99, 102, 241, 0.45);
  color: #818cf8;
}

.post-category-badge--life {
  border-color: rgba(52, 211, 153, 0.42);
  color: #34d399;
}

.post-category-badge--game {
  border-color: rgba(250, 204, 21, 0.45);
  color: #facc15;
}

.post-category-badge--idea {
  border-color: rgba(244, 114, 182, 0.45);
  color: #f472b6;
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.84);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.lightbox-image {
  max-width: min(1400px, 92vw);
  max-height: 88vh;
  object-fit: contain;
  border-radius: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

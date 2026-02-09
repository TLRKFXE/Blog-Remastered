<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isHome = computed(() => route.path === '/')
const isAdmin = computed(() => route.path.startsWith('/admin'))

const siteName = 'TLRK'

const routeFrontmatter = computed<Record<string, any>>(() => {
  const frontmatter = route.meta?.frontmatter
  if (frontmatter && typeof frontmatter === 'object')
    return frontmatter as Record<string, any>
  return {}
})

const routeTitle = computed(() => {
  const frontmatterTitle = routeFrontmatter.value.title

  if (route.path === '/')
    return ''

  if (route.path === '/blog')
    return 'Blog'

  if (route.path === '/projects')
    return 'Projects'

  if (route.path.startsWith('/admin'))
    return 'Admin'

  if (typeof frontmatterTitle === 'string' && frontmatterTitle)
    return frontmatterTitle

  return ''
})

const routeDescription = computed(() => {
  const frontmatterDescription = routeFrontmatter.value.description
  const frontmatterSubtitle = routeFrontmatter.value.subtitle

  if (typeof frontmatterDescription === 'string' && frontmatterDescription)
    return frontmatterDescription

  if (typeof frontmatterSubtitle === 'string' && frontmatterSubtitle)
    return frontmatterSubtitle

  return 'A personal blog'
})

useHead(() => ({
  title: routeTitle.value || undefined,
  titleTemplate: title => title ? `${title}-${siteName}` : siteName,
  meta: [
    { name: 'description', content: routeDescription.value },
  ],
}))

const mainClass = computed(() => {
  if (isHome.value)
    return ''

  if (isAdmin.value)
    return 'w-full px-6 xl:px-10 py-10 mt-14'

  return 'max-w-680px mx-auto px-6 py-10 mt-14'
})
</script>

<template>
  <div class="font-mono bg-base text-base min-h-screen transition-colors duration-300">
    <NavBar :transparent="isHome" />
    <main :class="mainClass">
      <RouterView />
    </main>
    <Footer />
    <BackToTop />
  </div>
</template>

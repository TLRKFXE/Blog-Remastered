<script setup lang="ts">
import type { PostFrontmatter } from '~/types'
import { useRoute, useRouter } from 'vue-router'
import { formatDate } from '~/composables'

const route = useRoute()
const router = useRouter()

const frontmatter = computed<Partial<PostFrontmatter>>(() => {
  const routeFrontmatter = route.meta?.frontmatter
  if (routeFrontmatter && typeof routeFrontmatter === 'object')
    return routeFrontmatter as Partial<PostFrontmatter>

  return {}
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/blog')
}
</script>

<template>
  <div v-if="frontmatter.title" class="slide-enter-content">
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-600 leading-tight mb-2 tracking-tight">
        {{ frontmatter.title }}
      </h1>
      <p v-if="frontmatter.subtitle" class="text-lg text-secondary mt-1 mb-0">
        {{ frontmatter.subtitle }}
      </p>
      <div class="flex items-center gap-3 mt-3 text-sm text-secondary font-mono">
        <time v-if="frontmatter.date">{{ formatDate(frontmatter.date) }}</time>
        <span v-if="frontmatter.duration" class="opacity-60">· {{ frontmatter.duration }}</span>
      </div>
    </div>

    <article class="prose">
      <slot />
    </article>

    <div class="mt-16 mb-4">
      <button
        class="text-sm font-mono opacity-40 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none text-base p-0"
        @click="goBack"
      >
        cd ..
      </button>
    </div>
  </div>
</template>

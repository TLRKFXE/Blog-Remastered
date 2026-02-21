<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
  title: 'Projects',
})
</script>

<template>
  <div class="slide-enter-content">
    <div class="mb-10">
      <h1 class="text-2xl font-600 tracking-tight mb-2">
        Projects
      </h1>
      <p class="text-secondary text-sm m-0">
        Selected builds and experiments.
      </p>
    </div>

    <div class="space-y-6">
      <article class="project-card">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 class="text-xl font-600 tracking-tight m-0">
              BiliShelf
            </h2>
            <p class="text-sm text-secondary mt-2 mb-0 leading-relaxed">
              A Bilibili collection helper focused on cleaner organization and better viewing flow.
            </p>
          </div>

          <a
            href="https://github.com/TLRKFXE/BiliShelf"
            target="_blank"
            rel="noopener"
            class="project-link"
          >
            GitHub →
          </a>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <span class="project-tag">TypeScript</span>
          <span class="project-tag">Vue</span>
          <span class="project-tag">Web Extension</span>
          <span class="project-tag">Bilibili</span>
        </div>
      </article>

      <p class="text-xs opacity-45 m-0 font-mono">
        More projects will be added here.
      </p>
    </div>
  </div>
</template>

<style scoped>
.project-card {
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 1rem 1rem 0.95rem;
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.project-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.04);
}

.project-link {
  font-size: 0.83rem;
  font-family: 'JetBrains Mono', monospace;
  text-decoration: none;
  opacity: 0.62;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.project-link:hover {
  opacity: 0.95;
  transform: translateX(2px);
}

.project-tag {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--c-border);
  border-radius: 9999px;
  padding: 0.13rem 0.55rem;
  font-size: 0.72rem;
  font-family: 'JetBrains Mono', monospace;
  opacity: 0.78;
}

:root:not(.dark) .project-card {
  background: rgba(0, 0, 0, 0.015);
}

:root:not(.dark) .project-card:hover {
  border-color: rgba(0, 0, 0, 0.18);
  background: rgba(0, 0, 0, 0.03);
}
</style>

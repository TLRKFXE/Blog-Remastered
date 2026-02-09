<script setup lang="ts">

const props = withDefaults(
  defineProps<{
    transparent?: boolean;
  }>(),
  {
    transparent: false,
  }
);

const { y } = useWindowScroll();
const scrolled = computed(() => y.value > 50);

const navClass = computed(() => {
  if (props.transparent && !scrolled.value) return "nav-transparent";

  return "glass-nav";
});
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-100 transition-all duration-400"
    :class="navClass"
  >
    <nav class="max-w-6xl mx-auto px-6 h-14 flex items-center">
      <RouterLink
        to="/"
        class="text-lg font-500 tracking-tight no-underline hover:opacity-80 transition-opacity"
      >
        TLRK
      </RouterLink>

      <div class="flex-1" />

      <div class="flex items-center gap-5">
        <RouterLink
          to="/blog"
          class="nav-link text-sm"
          active-class="!opacity-100"
        >
          Blog
        </RouterLink>
        <span
          class="nav-link text-sm opacity-45 cursor-not-allowed"
          title="Projects coming soon"
        >
          Projects (Coming Soon)
        </span>

        <div class="w-px h-4 bg-current opacity-15" />

        <a
          href="https://github.com/TLRKFXE"
          target="_blank"
          rel="noopener"
          class="icon-btn"
          title="GitHub"
        >
          <div class="i-ri-github-fill text-lg" />
        </a>

        <!--  <button class="icon-btn" title="Theme toggle disabled" disabled>
          <div v-if="isDark" class="i-ri-sun-line text-lg" />
          <div v-else class="i-ri-moon-line text-lg" />
        </button> -->
      </div>
    </nav>
  </header>
</template>

<style scoped>
.nav-transparent {
  background: transparent;
  border-bottom: 1px solid transparent;
}
</style>

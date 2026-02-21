<script setup lang="ts">
const brandText = "TLRK";
const brandLetters = brandText.split("");
const visibleCount = ref(0);

let brandTimer: ReturnType<typeof setTimeout> | null = null;
let direction: 1 | -1 = 1;

function clearBrandTimer() {
  if (brandTimer) {
    clearTimeout(brandTimer);
    brandTimer = null;
  }
}

function scheduleBrandStep(delay: number) {
  clearBrandTimer();
  brandTimer = setTimeout(() => {
    if (direction === 1) {
      if (visibleCount.value < brandLetters.length) {
        visibleCount.value += 1;
      }

      if (visibleCount.value >= brandLetters.length) {
        direction = -1;
        scheduleBrandStep(5000);
        return;
      }
    } else {
      if (visibleCount.value > 0) {
        visibleCount.value -= 1;
      }

      if (visibleCount.value <= 0) {
        direction = 1;
        scheduleBrandStep(520);
        return;
      }
    }

    scheduleBrandStep(300);
  }, delay);
}

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

onMounted(() => {
  scheduleBrandStep(260);
});

onUnmounted(() => {
  clearBrandTimer();
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
        class="text-2xl sm:text-3xl font-normal tracking-tight leading-none font-homemade no-underline hover:opacity-80 transition-opacity"
      >
        <span class="brand-text">
          <span
            v-for="(letter, index) in brandLetters"
            :key="`${letter}-${index}`"
            class="brand-letter"
            :class="{ 'brand-letter--visible': index < visibleCount }"
          >
            {{ letter }}
          </span>
        </span>
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

.brand-text {
  display: inline-flex;
  align-items: baseline;
  min-width: 4.2ch;
}

.brand-letter {
  opacity: 0;
  transform: translateY(0.04em);
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.brand-letter--visible {
  opacity: 1;
  transform: translateY(0);
}
</style>

<script setup lang="ts">
const { y } = useWindowScroll()

const show = computed(() => y.value > 300)

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <Transition name="fade">
    <button
      v-show="show"
      class="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full glass-card flex items-center justify-center cursor-pointer border-none icon-btn !opacity-60 hover:!opacity-100"
      title="Back to top"
      @click="scrollToTop"
    >
      <div class="i-ri-arrow-up-line" />
    </button>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

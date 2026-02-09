<script setup lang="ts">
import { isDark } from '~/composables'
</script>

<template>
  <button
    class="icon-btn"
    title="Theme toggle disabled"
    disabled
  >
    <div v-if="isDark" class="i-ri-sun-line" />
    <div v-else class="i-ri-moon-line" />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    hover?: boolean
  }>(),
  {
    hover: false,
  },
)
</script>

<template>
  <div
    class="glass-card p-5"
    :class="{ 'cursor-pointer': hover }"
  >
    <slot />
  </div>
</template>

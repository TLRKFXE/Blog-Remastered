<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement>()
let animationId: number
let flakes: { x: number; y: number; size: number; opacity: number; speed: number; drift: number }[] = []

function initFlakes(width: number, height: number) {
  const count = Math.floor((width * height) / 8000)
  flakes = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.4 + 0.2,
    speed: Math.random() * 0.8 + 0.3,
    drift: (Math.random() - 0.5) * 0.3,
  }))
}

function draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.clearRect(0, 0, width, height)

  for (const f of flakes) {
    // Fall down with horizontal drift
    f.y += f.speed
    f.x += f.drift

    // Reset when reaching bottom
    if (f.y > height) {
      f.y = -f.size
      f.x = Math.random() * width
    }

    // Wrap horizontally
    if (f.x < 0) f.x += width
    if (f.x > width) f.x -= width

    // Draw snowflake
    ctx.beginPath()
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`
    ctx.fill()
  }

  animationId = requestAnimationFrame(() => draw(ctx, width, height))
}

onMounted(() => {
  const el = canvas.value
  if (!el) return

  const resize = () => {
    const dpr = window.devicePixelRatio || 1
    el.width = window.innerWidth * dpr
    el.height = window.innerHeight * dpr
    el.style.width = `${window.innerWidth}px`
    el.style.height = `${window.innerHeight}px`
    const ctx = el.getContext('2d')!
    ctx.scale(dpr, dpr)
    initFlakes(window.innerWidth, window.innerHeight)
  }

  resize()
  window.addEventListener('resize', resize)

  const ctx = el.getContext('2d')!
  draw(ctx, window.innerWidth, window.innerHeight)

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resize)
  })
})
</script>

<template>
  <canvas
    ref="canvas"
    class="fixed inset-0 pointer-events-none z-0"
  />
</template>

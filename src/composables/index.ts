import { useDark, useToggle } from '@vueuse/core'
import dayjs from 'dayjs'

export const isDark = useDark({
  storageKey: 'vueuse-color-scheme',
})
export const toggleDark = useToggle(isDark)

interface ThemeTransitionOptions {
  origin?: 'pointer' | 'top-right'
}

function applyThemeTransitionClass(duration = 520) {
  const root = document.documentElement
  root.classList.add('theme-transitioning')

  window.setTimeout(() => {
    root.classList.remove('theme-transitioning')
  }, duration)
}

/**
 * Toggle dark mode with top-right radial spread transition.
 */
export function toggleDarkWithTransition(event?: MouseEvent, options: ThemeTransitionOptions = {}) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    toggleDark()
    return
  }

  const fromTopRight = options.origin === 'top-right'
  const x = fromTopRight ? window.innerWidth : (event?.clientX ?? window.innerWidth)
  const y = fromTopRight ? 0 : (event?.clientY ?? 0)

  const endRadius = Math.hypot(window.innerWidth, window.innerHeight)

  const root = document.documentElement
  root.style.setProperty('--theme-x', `${x}px`)
  root.style.setProperty('--theme-y', `${y}px`)
  root.style.setProperty('--theme-radius', `${endRadius}px`)
  root.classList.add('theme-transitioning')
  root.classList.add('theme-radial-transition')

  const overlay = document.createElement('div')
  overlay.className = 'theme-transition-overlay'
  document.body.appendChild(overlay)

  const onFinish = () => {
    overlay.remove()
    root.classList.remove('theme-transitioning')
    root.classList.remove('theme-radial-transition')
    root.style.removeProperty('--theme-x')
    root.style.removeProperty('--theme-y')
    root.style.removeProperty('--theme-radius')
  }

  const animation = overlay.animate(
    [
      { clipPath: `circle(0px at ${x}px ${y}px)` },
      { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` },
    ],
    {
      duration: 560,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    },
  )

  window.setTimeout(() => {
    toggleDark()
  }, 20)

  animation.finished
    .catch(() => {})
    .finally(() => {
      onFinish()
    })

  applyThemeTransitionClass(560)
}

export function formatDate(date: string | Date, onlyDate = true) {
  const d = dayjs(date)
  if (onlyDate)
    return d.format('MMM D, YYYY')
  return d.format('MMM D, YYYY · HH:mm')
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

declare module '*.md' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

declare module 'nprogress' {
  const NProgress: {
    start: () => void
    done: () => void
    configure: (opts: Record<string, any>) => void
  }
  export default NProgress
}

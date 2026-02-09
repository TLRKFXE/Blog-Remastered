import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { createHead } from '@unhead/vue/client'
import NProgress from 'nprogress'
import App from './App.vue'
import { isAllowedAdminEmail, supabase } from './lib/supabase'

import '@unocss/reset/tailwind.css'
import './styles/main.css'
import './styles/prose.css'
import './styles/glass.css'
import 'uno.css'

const app = createApp(App)

const head = createHead()
app.use(head)

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition)
      return savedPosition
    return { top: 0 }
  },
})

NProgress.configure({ showSpinner: false })
router.beforeEach(async (to) => {
  NProgress.start()

  if (to.path.startsWith('/admin')) {
    const hasSupabaseEnv
      = !!import.meta.env.VITE_SUPABASE_URL
      && !!import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!hasSupabaseEnv)
      return

    const { data, error } = await supabase.auth.getUser()

    if (error)
      return

    if (data.user && !isAllowedAdminEmail(data.user.email))
      return '/'
  }
})
router.afterEach(() => { NProgress.done() })
router.onError(() => { NProgress.done() })

app.use(router)
app.mount('#app')

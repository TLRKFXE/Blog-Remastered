<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'vue-router'
import { ADMIN_EMAIL, isAllowedAdminEmail, supabase } from '~/lib/supabase'
import { formatDate } from '~/composables'

type PostStatus = 'draft' | 'published'
type PostCategory = 'code' | 'life' | 'game' | 'idea'
type GalleryLayout = 'scroll'

interface AdminPostForm {
  slug: string
  title: string
  category: PostCategory
  description: string
  content_md: string
  cover_url: string
  status: PostStatus
  custom_published_at: string
}

interface AdminPostItem {
  id: string
  slug: string
  title: string
  category: PostCategory
  description: string | null
  content_md: string
  cover_url: string | null
  status: PostStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

const router = useRouter()

const loading = ref(true)
const submitting = ref(false)
const uploading = ref(false)

const authEmail = ref('')
const message = ref('')
const errorMessage = ref('')

const user = ref<User | null>(null)
let authListenerCleanup: (() => void) | undefined

const posts = ref<AdminPostItem[]>([])
const selectedPostId = ref<string | null>(null)

const contentTextarea = ref<HTMLTextAreaElement | null>(null)
const uploadedMediaUrls = ref<string[]>([])
const galleryLayout = ref<GalleryLayout>('scroll')

const form = ref<AdminPostForm>({
  slug: '',
  title: '',
  category: 'idea',
  description: '',
  content_md: '',
  cover_url: '',
  status: 'draft',
  custom_published_at: '',
})

const isAdmin = computed(() => isAllowedAdminEmail(user.value?.email))

const editingPost = computed(() => {
  if (!selectedPostId.value)
    return null
  return posts.value.find(post => post.id === selectedPostId.value) || null
})

const canSubmit = computed(() => {
  return !!form.value.slug.trim()
    && !!form.value.title.trim()
    && !!form.value.content_md.trim()
    && !submitting.value
    && isAdmin.value
})

const canDelete = computed(() => !!selectedPostId.value && isAdmin.value && !submitting.value)

const postList = computed(() => {
  return [...posts.value].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
})

function resetMessage() {
  message.value = ''
  errorMessage.value = ''
}

function normalizeEnvValue(value: string | undefined) {
  if (!value)
    return ''

  const trimmed = value.trim()
  return trimmed.replace(/^['\"](.*)['\"]$/, '$1').trim()
}

function getAdminRedirectUrl() {
  const configured = normalizeEnvValue(import.meta.env.VITE_AUTH_REDIRECT_TO)
  if (configured)
    return configured

  return `${window.location.origin}/admin`
}

function sanitizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

function createEmptyForm(): AdminPostForm {
  return {
    slug: '',
    title: '',
    category: 'idea',
    description: '',
    content_md: '',
    cover_url: '',
    status: 'draft',
    custom_published_at: '',
  }
}

function startNewPost() {
  selectedPostId.value = null
  form.value = createEmptyForm()
  uploadedMediaUrls.value = []
  resetMessage()
}

function selectPost(post: AdminPostItem) {
  selectedPostId.value = post.id
  form.value = {
    slug: post.slug,
    title: post.title,
    category: post.category || 'idea',
    description: post.description || '',
    content_md: post.content_md,
    cover_url: post.cover_url || '',
    status: post.status,
    custom_published_at: post.published_at ? post.published_at.slice(0, 16) : '',
  }
  uploadedMediaUrls.value = []
  resetMessage()
}

function resolvePublishedAt(input: string) {
  const normalized = input.trim()
  if (!normalized)
    return null

  const parsed = Date.parse(normalized)
  if (Number.isNaN(parsed))
    return null

  return new Date(parsed).toISOString()
}

function insertAtCursor(text: string) {
  const textarea = contentTextarea.value
  if (!textarea) {
    form.value.content_md += text
    return
  }

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const original = form.value.content_md
  form.value.content_md = `${original.slice(0, start)}${text}${original.slice(end)}`

  nextTick(() => {
    const caret = start + text.length
    textarea.focus()
    textarea.setSelectionRange(caret, caret)
  })
}

function buildGalleryBlock(urls: string[], layout: GalleryLayout) {
  if (!urls.length)
    return ''

  if (layout === 'scroll') {
    return `\n[gallery-scroll]\n${urls.join('\n')}\n[/gallery-scroll]\n`
  }

  return ''
}

function copyText(text: string) {
  if (!navigator.clipboard) {
    errorMessage.value = 'Clipboard API unavailable in this browser.'
    return
  }

  navigator.clipboard.writeText(text)
    .then(() => {
      message.value = 'Copied to clipboard.'
    })
    .catch(() => {
      errorMessage.value = 'Failed to copy.'
    })
}

async function refreshUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error)
    throw error

  user.value = data.user
}

async function sendMagicLink() {
  resetMessage()

  const email = authEmail.value.trim().toLowerCase()
  if (!email) {
    errorMessage.value = 'Please enter your email.'
    return
  }

  if (ADMIN_EMAIL && email !== ADMIN_EMAIL.toLowerCase()) {
    errorMessage.value = 'This email is not allowed.'
    return
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getAdminRedirectUrl(),
    },
  })

  if (error) {
    errorMessage.value = error.message
    return
  }

  message.value = 'Magic link sent. Check your inbox.'
}

async function signOut() {
  await supabase.auth.signOut()
  user.value = null
  posts.value = []
  startNewPost()
  message.value = 'Signed out.'
}

function makeFilePath(folder: string, file: File) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `${folder}/${stamp}.${ext}`
}

async function uploadImage(file: File, folder: string) {
  const path = makeFilePath(folder, file)

  const { error } = await supabase.storage
    .from('post-media')
    .upload(path, file, {
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    })

  if (error)
    throw error

  const { data } = supabase.storage
    .from('post-media')
    .getPublicUrl(path)

  return data.publicUrl
}

async function onCoverFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file)
    return

  resetMessage()
  uploading.value = true

  try {
    const url = await uploadImage(file, 'covers')
    form.value.cover_url = url
    message.value = 'Cover uploaded.'
  }
  catch (error: any) {
    errorMessage.value = error?.message || 'Failed to upload cover.'
  }
  finally {
    uploading.value = false
    input.value = ''
  }
}

async function onBodyFilesChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (!files.length)
    return

  resetMessage()
  uploading.value = true

  try {
    const urls: string[] = []
    for (const file of files) {
      const url = await uploadImage(file, 'content')
      urls.push(url)
    }

    uploadedMediaUrls.value = [...urls, ...uploadedMediaUrls.value]
    message.value = `${urls.length} image(s) uploaded.`
  }
  catch (error: any) {
    errorMessage.value = error?.message || 'Failed to upload content images.'
  }
  finally {
    uploading.value = false
    input.value = ''
  }
}

function insertImage(url: string) {
  insertAtCursor(`![image](${url})`)
}

function insertGallery(urls: string[]) {
  const block = buildGalleryBlock(urls, galleryLayout.value)
  if (!block)
    return
  insertAtCursor(block)
}

async function loadPosts() {
  if (!isAdmin.value)
    return

  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title, category, description, content_md, cover_url, status, published_at, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    errorMessage.value = error.message
    return
  }

  posts.value = (data || []) as AdminPostItem[]
}

async function savePost() {
  if (!canSubmit.value)
    return

  resetMessage()
  submitting.value = true

  try {
    const slug = sanitizeSlug(form.value.slug)
    if (!slug) {
      errorMessage.value = 'Slug is required.'
      return
    }

    const current = editingPost.value
    const now = new Date().toISOString()
    const customPublishedAt = resolvePublishedAt(form.value.custom_published_at)

    if (form.value.custom_published_at.trim() && !customPublishedAt) {
      errorMessage.value = 'Publish date is invalid.'
      return
    }

    const payload = {
      slug,
      title: form.value.title.trim(),
      category: form.value.category,
      description: form.value.description.trim() || null,
      content_md: form.value.content_md,
      cover_url: form.value.cover_url.trim() || null,
      status: form.value.status,
      published_at: form.value.status === 'published'
        ? (customPublishedAt || current?.published_at || now)
        : null,
      updated_at: now,
    }

    let savedId: string | null = null

    if (selectedPostId.value) {
      const { data, error } = await supabase
        .from('posts')
        .update(payload)
        .eq('id', selectedPostId.value)
        .select('id')
        .single()

      if (error)
        throw error

      savedId = data.id
      message.value = 'Post updated.'
    }
    else {
      const { data, error } = await supabase
        .from('posts')
        .insert(payload)
        .select('id')
        .single()

      if (error)
        throw error

      savedId = data.id
      message.value = 'Post created.'
    }

    await loadPosts()

    if (savedId) {
      const savedPost = posts.value.find(post => post.id === savedId)
      if (savedPost)
        selectPost(savedPost)
    }
  }
  catch (error: any) {
    errorMessage.value = error?.message || 'Failed to save post.'
  }
  finally {
    submitting.value = false
  }
}

async function deletePost() {
  if (!selectedPostId.value || !canDelete.value)
    return

  resetMessage()
  submitting.value = true

  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', selectedPostId.value)

    if (error)
      throw error

    message.value = 'Post deleted.'
    selectedPostId.value = null
    form.value = createEmptyForm()
    uploadedMediaUrls.value = []
    await loadPosts()
  }
  catch (error: any) {
    errorMessage.value = error?.message || 'Failed to delete post.'
  }
  finally {
    submitting.value = false
  }
}

async function initializeAdmin() {
  loading.value = true
  resetMessage()

  try {
    await refreshUser()

    if (!user.value) {
      loading.value = false
      return
    }

    if (!isAdmin.value) {
      await signOut()
      router.replace('/')
      return
    }

    await loadPosts()
  }
  catch (error: any) {
    errorMessage.value = error?.message || 'Failed to initialize admin.'
  }
  finally {
    loading.value = false
  }
}

async function handleAuthRedirectIfNeeded() {
  const url = new URL(window.location.href)
  const hash = window.location.hash.startsWith('#')
    ? new URLSearchParams(window.location.hash.slice(1))
    : new URLSearchParams()

  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash') || hash.get('token_hash')
  const type = url.searchParams.get('type') || hash.get('type')

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error)
        throw error
    }
    else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as any,
      })
      if (error)
        throw error
    }
  }
  catch (error: any) {
    errorMessage.value = error?.message || 'Failed to finish magic link sign in.'
  }
  finally {
    if (code || tokenHash) {
      window.history.replaceState({}, '', '/admin')
    }
  }
}

onMounted(async () => {
  await handleAuthRedirectIfNeeded()
  await initializeAdmin()

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null

    if (!user.value) {
      posts.value = []
      startNewPost()
      return
    }

    if (!isAllowedAdminEmail(user.value.email)) {
      signOut()
      router.replace('/')
      return
    }

    loadPosts()
  })

  authListenerCleanup = () => {
    listener.subscription.unsubscribe()
  }
})

onUnmounted(() => {
  authListenerCleanup?.()
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-600 tracking-tight mb-2">Admin</h1>
      <p class="text-secondary text-sm m-0">Manage posts stored in Supabase.</p>
    </div>

    <div v-if="loading" class="text-sm opacity-60">
      Loading...
    </div>

    <template v-else>
      <div v-if="!user" class="max-w-md space-y-4">
        <p class="text-sm opacity-75 m-0">
          Sign in with your admin email to continue.
        </p>
        <div>
          <label class="text-xs uppercase opacity-60">Email</label>
          <input
            v-model="authEmail"
            type="email"
            class="w-full mt-1 bg-transparent border border-base rounded px-3 py-2 text-sm"
            placeholder="you@example.com"
          >
        </div>
        <button class="hero-btn hero-btn--primary" @click="sendMagicLink">
          Send Magic Link
        </button>
      </div>

      <div v-else-if="!isAdmin" class="text-sm text-[#ef4444]">
        Access denied.
      </div>

      <div v-else class="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-600 tracking-tight m-0">Posts</h2>
            <button
              class="text-sm font-mono opacity-55 hover:opacity-90 transition-opacity bg-transparent border-none cursor-pointer"
              @click="startNewPost"
            >
              + New
            </button>
          </div>

          <div class="space-y-2 max-h-[70vh] overflow-auto pr-1">
            <button
              v-for="item in postList"
              :key="item.id"
              class="post-item"
              :class="selectedPostId === item.id ? 'post-item--active' : ''"
              @click="selectPost(item)"
            >
              <div class="flex items-center justify-between gap-3">
                <strong class="text-sm truncate">{{ item.title }}</strong>
                <div class="flex items-center gap-2">
                  <span class="text-xs opacity-55 uppercase">{{ item.category || 'idea' }}</span>
                  <span class="text-xs opacity-55 uppercase">{{ item.status }}</span>
                </div>
              </div>
              <div class="text-xs opacity-55 mt-1 font-mono">
                {{ item.slug }}
              </div>
              <div class="text-xs opacity-40 mt-1 font-mono">
                updated {{ formatDate(item.updated_at) }}
              </div>
            </button>

            <p v-if="!postList.length" class="text-sm opacity-45 m-0 py-6 text-center">
              No posts yet.
            </p>
          </div>
        </aside>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-600 tracking-tight m-0">
              {{ selectedPostId ? 'Edit Post' : 'New Post' }}
            </h2>
            <div class="flex items-center gap-2">
              <button
                v-if="selectedPostId"
                class="text-sm font-mono opacity-55 hover:opacity-90 transition-opacity bg-transparent border-none cursor-pointer"
                @click="startNewPost"
              >
                clear
              </button>
              <button
                class="text-sm font-mono opacity-55 hover:opacity-90 transition-opacity bg-transparent border-none cursor-pointer"
                @click="signOut"
              >
                sign out
              </button>
            </div>
          </div>

          <div>
            <label class="text-xs uppercase opacity-60">Slug</label>
            <input
              v-model="form.slug"
              type="text"
              class="w-full mt-1 bg-transparent border border-base rounded px-3 py-2 text-sm"
              placeholder="hello-tokyo"
            >
          </div>

          <div class="grid sm:grid-cols-3 gap-3">
            <div>
              <label class="text-xs uppercase opacity-60">Title</label>
              <input
                v-model="form.title"
                type="text"
                class="w-full mt-1 bg-transparent border border-base rounded px-3 py-2 text-sm"
                placeholder="Hello Tokyo"
              >
            </div>

            <div>
              <label class="text-xs uppercase opacity-60">Status</label>
              <select
                v-model="form.status"
                class="w-full mt-1 bg-transparent border border-base rounded px-3 py-2 text-sm"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </div>

            <div>
              <label class="text-xs uppercase opacity-60">Category</label>
              <select
                v-model="form.category"
                class="w-full mt-1 bg-transparent border border-base rounded px-3 py-2 text-sm"
              >
                <option value="code">Code</option>
                <option value="life">Life</option>
                <option value="game">Game</option>
                <option value="idea">Idea</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs uppercase opacity-60">Description</label>
            <input
              v-model="form.description"
              type="text"
              class="w-full mt-1 bg-transparent border border-base rounded px-3 py-2 text-sm"
              placeholder="Short summary"
            >
          </div>

          <div>
            <label class="text-xs uppercase opacity-60">Published At (Optional)</label>
            <input
              v-model="form.custom_published_at"
              type="datetime-local"
              class="w-full mt-1 bg-transparent border border-base rounded px-3 py-2 text-sm"
            >
            <p class="text-xs opacity-45 mt-2 mb-0">
              Set this to publish historical posts (e.g. a post written in 2024).
            </p>
          </div>

          <div>
            <label class="text-xs uppercase opacity-60">Cover Image</label>
            <div class="mt-1 flex flex-col sm:flex-row gap-3">
              <input
                v-model="form.cover_url"
                type="url"
                class="flex-1 bg-transparent border border-base rounded px-3 py-2 text-sm"
                placeholder="https://..."
              >
              <label class="hero-btn cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onCoverFileChange"
                >
                {{ uploading ? 'Uploading...' : 'Upload Cover' }}
              </label>
            </div>
          </div>

          <div class="media-tools space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              <label class="hero-btn cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="onBodyFilesChange"
                >
                {{ uploading ? 'Uploading...' : 'Upload Content Images' }}
              </label>

              <select
                v-model="galleryLayout"
                class="bg-transparent border border-base rounded px-3 py-1.5 text-xs"
              >
                <option value="scroll">gallery: horizontal scroll</option>
              </select>

              <button
                class="hero-btn !px-3 !py-1.5 !text-xs"
                :disabled="uploadedMediaUrls.length < 2"
                @click="insertGallery(uploadedMediaUrls)"
              >
                Insert Gallery Block
              </button>
            </div>

            <div v-if="uploadedMediaUrls.length" class="uploaded-list">
              <div class="text-xs opacity-65 mb-2">Uploaded images</div>
              <div v-for="url in uploadedMediaUrls" :key="url" class="uploaded-item">
                <code class="uploaded-url">{{ url }}</code>
                <div class="flex items-center gap-2">
                  <button class="text-btn" @click="insertImage(url)">insert</button>
                  <button class="text-btn" @click="copyText(url)">copy</button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="text-xs uppercase opacity-60">Content (Markdown)</label>
            <textarea
              ref="contentTextarea"
              v-model="form.content_md"
              rows="18"
              class="w-full mt-1 bg-transparent border border-base rounded px-3 py-2 text-sm font-mono"
              placeholder="# Hello Tokyo"
            />
            <p class="text-xs opacity-45 mt-2 mb-0">
              Tip: multi-image horizontal block syntax: `[gallery-scroll] ... [/gallery-scroll]`
            </p>
          </div>

          <div class="flex flex-wrap gap-3 items-center">
            <button
              class="hero-btn hero-btn--primary"
              :disabled="!canSubmit"
              @click="savePost"
            >
              {{ submitting ? 'Saving...' : (selectedPostId ? 'Update Post' : 'Create Post') }}
            </button>

            <button
              v-if="selectedPostId"
              class="hero-btn hero-btn--danger"
              :disabled="!canDelete"
              @click="deletePost"
            >
              Delete Post
            </button>
          </div>
        </section>
      </div>

      <p v-if="message" class="text-sm text-[#22c55e] mt-4 mb-0">{{ message }}</p>
      <p v-if="errorMessage" class="text-sm text-[#ef4444] mt-2 mb-0">{{ errorMessage }}</p>
    </template>
  </div>
</template>

<style scoped>
.hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid var(--c-border);
  border-radius: 9999px;
  background: var(--c-bg-soft);
  color: inherit;
  text-decoration: none;
  transition: all 0.2s ease;
}

.hero-btn:hover {
  opacity: 0.92;
}

.hero-btn--primary {
  border-color: rgba(62, 175, 124, 0.35);
}

.hero-btn--danger {
  border-color: rgba(239, 68, 68, 0.35);
}

.hero-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.post-item {
  width: 100%;
  text-align: left;
  border: 1px solid var(--c-border);
  background: transparent;
  border-radius: 10px;
  padding: 0.7rem;
  color: inherit;
  cursor: pointer;
}

.post-item--active {
  border-color: rgba(62, 175, 124, 0.45);
  background: rgba(62, 175, 124, 0.05);
}

.media-tools {
  border: 1px dashed var(--c-border);
  border-radius: 10px;
  padding: 0.8rem;
}

.uploaded-list {
  max-height: 180px;
  overflow: auto;
  padding-right: 0.2rem;
}

.uploaded-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  border-top: 1px solid var(--c-border);
  padding: 0.45rem 0;
}

.uploaded-item:first-of-type {
  border-top: none;
}

.uploaded-url {
  display: inline-block;
  max-width: 72%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
}

.text-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  opacity: 0.65;
  color: inherit;
}

.text-btn:hover {
  opacity: 1;
}
</style>

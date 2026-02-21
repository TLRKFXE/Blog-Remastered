<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { formatDate } from "~/composables";
import { supabase } from "~/lib/supabase";

type PostCategory = "code" | "life" | "game" | "idea";
type CategoryFilter = "all" | PostCategory;

const CATEGORY_LABELS: Record<PostCategory, string> = {
  code: "Code",
  life: "Life",
  game: "Game",
  idea: "Idea",
};

const CATEGORY_ORDER: PostCategory[] = ["code", "life", "game", "idea"];

const props = defineProps<{
  limit?: number;
  recentMonths?: number;
  showCategories?: boolean;
}>();

interface PostListItem {
  path: string;
  title: string;
  date: string;
  duration?: string;
  lang?: string;
  draft?: boolean;
  source: "remote";
  category: PostCategory;
}

interface RemotePostRow {
  slug: string;
  title: string;
  published_at: string | null;
  created_at: string;
  category: string | null;
}

const remotePosts = ref<PostListItem[]>([]);
const selectedCategory = ref<CategoryFilter>("all");

function isValidDate(date: string): boolean {
  return !Number.isNaN(Date.parse(date));
}

function normalizeCategory(value: string | null | undefined): PostCategory {
  const normalized = value?.toLowerCase().trim();

  if (normalized === "code" || normalized === "life" || normalized === "game" || normalized === "idea") {
    return normalized;
  }

  return "idea";
}

function categoryLabel(category: PostCategory): string {
  return CATEGORY_LABELS[category];
}

const recentCutoffTimestamp = computed<number | null>(() => {
  const recentMonths
    = props.recentMonths && props.recentMonths > 0
      ? props.recentMonths
      : undefined;

  if (!recentMonths)
    return null;

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - recentMonths);
  return cutoff.getTime();
});

const datedPosts = computed<PostListItem[]>(() => {
  return [...remotePosts.value]
    .filter(post => post.date && isValidDate(post.date))
    .filter((post) => {
      if (recentCutoffTimestamp.value === null)
        return true;

      return Date.parse(post.date) >= recentCutoffTimestamp.value;
    })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
});

const categoryFilters = computed(() => {
  const counts: Record<PostCategory, number> = {
    code: 0,
    life: 0,
    game: 0,
    idea: 0,
  };

  for (const post of datedPosts.value) {
    counts[post.category] += 1;
  }

  return [
    { key: "all" as const, label: "All", count: datedPosts.value.length },
    ...CATEGORY_ORDER.map(category => ({
      key: category,
      label: categoryLabel(category),
      count: counts[category],
    })),
  ];
});

const posts = computed<PostListItem[]>(() => {
  const filtered = selectedCategory.value === "all"
    ? datedPosts.value
    : datedPosts.value.filter(post => post.category === selectedCategory.value);

  return props.limit && props.limit > 0
    ? filtered.slice(0, props.limit)
    : filtered;
});

const postsByYear = computed<[string, PostListItem[]][]>(() => {
  const groups: Record<string, PostListItem[]> = {};

  for (const post of posts.value) {
    const year = new Date(post.date).getFullYear().toString();
    if (!groups[year])
      groups[year] = [];
    groups[year].push(post);
  }

  return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
});

function setCategory(filter: CategoryFilter) {
  selectedCategory.value = filter;
}

async function loadRemotePosts() {
  const hasSupabaseEnv
    = !!import.meta.env.VITE_SUPABASE_URL
    && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!hasSupabaseEnv)
    return;

  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, published_at, created_at, category")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[posts] failed to load remote posts:", error.message);
    return;
  }

  remotePosts.value = (data || [])
    .filter((post): post is RemotePostRow => !!post.slug && !!post.title)
    .map(post => ({
      path: `/posts/${post.slug}`,
      title: post.title,
      date: post.published_at || post.created_at,
      source: "remote",
      category: normalizeCategory(post.category),
    }));
}

onMounted(async () => {
  await loadRemotePosts();
});
</script>

<template>
  <div class="slide-enter-content">
    <div v-if="showCategories" class="post-category-filter">
      <button
        v-for="filter in categoryFilters"
        :key="filter.key"
        class="category-tab"
        :class="selectedCategory === filter.key ? 'category-tab--active' : ''"
        type="button"
        @click="setCategory(filter.key)"
      >
        <span>{{ filter.label }}</span>
      </button>
    </div>

    <template v-for="[year, yearPosts] in postsByYear" :key="year">
      <div class="relative h-20 pointer-events-none">
        <span
          class="absolute -left-3 top-0 text-8em font-bold opacity-7 leading-none select-none"
          style="letter-spacing: -0.04em"
        >
          {{ year }}
        </span>
      </div>

      <div v-for="post in yearPosts" :key="post.path" class="mb-6">
        <RouterLink
          :to="post.path"
          class="group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 no-underline"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="post-category-badge" :class="`post-category-badge--${post.category}`">
              {{ categoryLabel(post.category) }}
            </span>
            <div
              class="text-lg text-base transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--c-brand)] truncate"
            >
              {{ post.title }}
            </div>
          </div>

          <div
            class="flex-1 hidden sm:block border-b border-dashed border-base"
          />
          <div class="text-sm text-secondary font-mono whitespace-nowrap">
            {{ formatDate(post.date) }}
            <span v-if="post.duration" class="opacity-60 ml-2"
              >· {{ post.duration }}</span
            >
          </div>
        </RouterLink>
      </div>
    </template>

    <div v-if="posts.length === 0" class="text-center py-20 opacity-40">
      <p>No posts yet.</p>
    </div>
  </div>
</template>

<style scoped>
.post-category-filter {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 0.95rem;
  margin: 0.1rem 0 1.9rem;
}

.category-tab {
  position: relative;
  display: inline-block;
  border: none;
  background: transparent;
  color: var(--c-text-light);
  padding: 0.06rem;
  font-size: clamp(1.25rem, 3vw, 2rem);
  line-height: 1.12;
  letter-spacing: -0.01em;
  opacity: 0.4;
  cursor: pointer;
  transition: color 0.2s ease, opacity 0.2s ease;
}

.category-tab:hover {
  color: var(--c-text);
  opacity: 0.74;
}

.category-tab--active {
  color: var(--c-text);
  opacity: 1;
}

.post-category-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.9rem;
  border-radius: 9999px;
  border: 1px solid var(--c-border);
  padding: 0.15rem 0.58rem;
  font-size: 0.67rem;
  font-family: "JetBrains Mono", monospace;
  line-height: 1.2;
  opacity: 0.86;
}

.post-category-badge--code {
  border-color: rgba(99, 102, 241, 0.45);
  color: #818cf8;
}

.post-category-badge--life {
  border-color: rgba(52, 211, 153, 0.42);
  color: #34d399;
}

.post-category-badge--game {
  border-color: rgba(250, 204, 21, 0.45);
  color: #facc15;
}

.post-category-badge--idea {
  border-color: rgba(244, 114, 182, 0.45);
  color: #f472b6;
}

:root:not(.dark) .category-tab:hover {
  opacity: 0.8;
}

@media (max-width: 640px) {
  .post-category-filter {
    gap: 0.72rem;
  }

  .category-tab {
    font-size: 1.16rem;
  }
}
</style>

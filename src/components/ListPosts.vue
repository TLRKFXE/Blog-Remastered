<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { formatDate } from "~/composables";
import { supabase } from "~/lib/supabase";

const props = defineProps<{
  limit?: number;
  recentMonths?: number;
}>();

interface PostListItem {
  path: string;
  title: string;
  date: string;
  duration?: string;
  lang?: string;
  draft?: boolean;
  source: "remote";
}

interface RemotePostRow {
  slug: string;
  title: string;
  published_at: string | null;
  created_at: string;
}

const remotePosts = ref<PostListItem[]>([]);

function isValidDate(date: string): boolean {
  return !Number.isNaN(Date.parse(date));
}

const posts = computed<PostListItem[]>(() => {
  const recentMonths =
    props.recentMonths && props.recentMonths > 0
      ? props.recentMonths
      : undefined;

  const cutoffTimestamp = (() => {
    if (!recentMonths) return null;

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - recentMonths);
    return cutoff.getTime();
  })();

  const allPosts = [...remotePosts.value]
    .filter((post) => post.date && isValidDate(post.date))
    .filter((post) => {
      if (cutoffTimestamp === null) return true;

      return Date.parse(post.date) >= cutoffTimestamp;
    })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  return props.limit && props.limit > 0
    ? allPosts.slice(0, props.limit)
    : allPosts;
});

const postsByYear = computed<[string, PostListItem[]][]>(() => {
  const groups: Record<string, PostListItem[]> = {};

  for (const post of posts.value) {
    const year = new Date(post.date).getFullYear().toString();
    if (!groups[year]) groups[year] = [];
    groups[year].push(post);
  }

  return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
});

async function loadRemotePosts() {
  const hasSupabaseEnv =
    !!import.meta.env.VITE_SUPABASE_URL &&
    !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!hasSupabaseEnv) return;

  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[posts] failed to load remote posts:", error.message);
    return;
  }

  remotePosts.value = (data || [])
    .filter((post): post is RemotePostRow => !!post.slug && !!post.title)
    .map((post) => ({
      path: `/posts/${post.slug}`,
      title: post.title,
      date: post.published_at || post.created_at,
      source: "remote",
    }));
}

onMounted(async () => {
  await loadRemotePosts();
});
</script>

<template>
  <div class="slide-enter-content">
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
          <div
            class="text-lg text-base transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--c-brand)]"
          >
            {{ post.title }}
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

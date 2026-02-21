<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

interface SocialLink {
  icon: string;
  href: string;
  label: string;
}

interface NavButton {
  label: string;
  to?: string;
  disabled?: boolean;
}

interface TechIcon {
  name: string;
  icon: string;
}

interface TechIconGroup {
  titleZh: string;
  titleEn: string;
  items: TechIcon[];
}

interface TechStackRow {
  label: string;
  value: string;
}

interface TechStackSection {
  title: string;
  rows?: TechStackRow[];
  items?: string[];
}

const fullName = "TLRK";
const contactEmail = "tlrkfx@gmail.com";
const emailHref = `mailto:${contactEmail}`;

const typedName = ref("");
const showCursor = ref(true);
const showContent = ref(false);

let typingInterval: ReturnType<typeof setInterval> | undefined;
let cursorInterval: ReturnType<typeof setInterval> | undefined;

const socialLinks: SocialLink[] = [
  {
    icon: "i-ri-github-fill",
    href: "https://github.com/TLRKFXE",
    label: "GitHub",
  },
  {
    icon: "i-ri-twitter-x-fill",
    href: "https://x.com/ETlrk",
    label: "Twitter",
  },
  {
    icon: "i-ri-bilibili-fill",
    href: "https://space.bilibili.com/29192997",
    label: "Bilibili",
  },
  {
    icon: "i-ri-ubuntu-fill",
    href: "https://linux.do/u/tlrk/summary",
    label: "Linuxdo",
  },
  {
    icon: "i-ri-steam-fill",
    href: "https://steamcommunity.com/profiles/76561198284684995/",
    label: "Steam",
  },
  {
    icon: "i-ri-telegram-fill",
    href: "https://t.me/TLRKFX",
    label: "Telegram",
  },
  { icon: "i-ri-mail-fill", href: emailHref, label: "Email" },
];

const navButtons: NavButton[] = [
  { label: "Blog", to: "/blog" },
  { label: "Projects (Coming Soon)", disabled: true },
];

const techIconGroups: TechIconGroup[] = [
  {
    titleZh: "前端核心",
    titleEn: "Frontend Core",
    items: [
      { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
      { name: "Vue 3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
      { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
      { name: "Vue Router", icon: "https://api.iconify.design/ri:route-line.svg?color=%2342d392" },
      { name: "TanStack Query", icon: "https://cdn.simpleicons.org/tanstack/ff4154" },
      { name: "Pinia", icon: "https://cdn.simpleicons.org/pinia" },
      { name: "VueUse", icon: "https://cdn.simpleicons.org/vueuse" },
      { name: "VeeValidate", icon: "https://api.iconify.design/ri:shield-check-line.svg?color=%2342d392" },
      { name: "Yup", icon: "https://api.iconify.design/ri:check-double-line.svg?color=%2342d392" },
      { name: "Vue Toastification", icon: "https://api.iconify.design/ri:notification-3-line.svg?color=%23f59e0b" },
      { name: "Faker.js", icon: "https://api.iconify.design/ri:test-tube-line.svg?color=%23f97316" },
    ],
  },
  {
    titleZh: "UI 组件库",
    titleEn: "UI Libraries & Component Systems",
    items: [
      { name: "shadcn/ui", icon: "https://cdn.simpleicons.org/shadcnui/ffffff" },
      { name: "DaisyUI", icon: "https://cdn.simpleicons.org/daisyui" },
      { name: "PrimeVue", icon: "https://cdn.simpleicons.org/primevue" },
      { name: "Inspira UI", icon: "https://api.iconify.design/ri:sparkling-line.svg?color=%23818cf8" },
      { name: "Hero UI", icon: "https://cdn.simpleicons.org/heroui/38bdf8" },
      { name: "Radix UI", icon: "https://cdn.simpleicons.org/radixui/c084fc" },
      { name: "Headless UI", icon: "https://cdn.simpleicons.org/headlessui" },
      { name: "Fluent UI", icon: "https://api.iconify.design/ri:apps-2-line.svg?color=%230ea5e9" },
      { name: "Base UI", icon: "https://api.iconify.design/ri:layout-2-line.svg?color=%238b8b8b" },
      { name: "Material UI", icon: "https://cdn.simpleicons.org/mui" },
      { name: "Ant Design", icon: "https://cdn.simpleicons.org/antdesign" },
      { name: "Floating UI", icon: "https://api.iconify.design/ri:drag-move-2-line.svg?color=%238b8b8b" },
    ],
  },
  {
    titleZh: "后端与数据",
    titleEn: "Backend & Data",
    items: [
      { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
      { name: "NestJS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg" },
      { name: "Express", icon: "https://cdn.simpleicons.org/express/ffffff" },
      { name: "GraphQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
      { name: "RESTful API", icon: "https://cdn.simpleicons.org/openapiinitiative/6ba539" },
      { name: "Supabase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" },
      { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
      { name: "Prisma", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" },
      { name: "Drizzle", icon: "https://cdn.simpleicons.org/drizzle" },
      { name: "Sequelize", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sequelize/sequelize-original.svg" },
    ],
  },
  {
    titleZh: "工具链与交付",
    titleEn: "Tooling & Delivery",
    items: [
      { name: "pnpm", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pnpm/pnpm-original.svg" },
      { name: "Vite", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" },
      { name: "Vitest", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitest/vitest-original.svg" },
      { name: "Tailwind CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
      { name: "UnoCSS", icon: "https://cdn.simpleicons.org/unocss" },
      { name: "ESLint", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/eslint/eslint-original.svg" },
      { name: "Prettier", icon: "https://cdn.simpleicons.org/prettier" },
      { name: "Apifox", icon: "https://cdn.simpleicons.org/apifox" },
      { name: "dotenvx", icon: "https://cdn.simpleicons.org/dotenv" },
      { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
      { name: "Docker", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
      { name: "Nginx", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg" },
      { name: "Cloudflare", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cloudflare/cloudflare-original.svg" },
    ],
  },
  {
    titleZh: "设计协作",
    titleEn: "Design",
    items: [
      { name: "Figma", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
      { name: "Dribbble", icon: "https://cdn.simpleicons.org/dribbble" },
    ],
  },
];

const techStackSections: TechStackSection[] = [
  {
    title: "Frontend Core",
    rows: [
      { label: "Language", value: "TypeScript" },
      { label: "Framework", value: "Vue 3 / React" },
      { label: "Routing", value: "Vue Router" },
      { label: "State Management", value: "Pinia" },
      { label: "Data Fetching & Server State", value: "TanStack Query" },
      { label: "Form & Validation", value: "VeeValidate / Yup" },
      { label: "Composition Utilities", value: "VueUse" },
    ],
  },
  {
    title: "UI Libraries & Component Systems",
    rows: [
      { label: "Full Design System", value: "Material UI / Ant Design / Fluent UI / PrimeVue" },
      { label: "Utility / Style-based UI", value: "shadcn/ui / DaisyUI / Hero UI / Inspira UI" },
      { label: "Headless / Unstyled Components", value: "Radix UI / Headless UI / Base UI" },
      { label: "Interaction Engine", value: "Floating UI" },
    ],
  },
  {
    title: "Backend & Data",
    rows: [
      { label: "Runtime", value: "Node.js" },
      { label: "Framework", value: "NestJS / Express.js" },
      { label: "API Architecture", value: "RESTful / GraphQL" },
      { label: "Database", value: "PostgreSQL" },
      { label: "ORM", value: "Prisma / Drizzle / Sequelize" },
      { label: "BaaS", value: "Supabase" },
    ],
  },
  {
    title: "Tooling & Delivery",
    rows: [
      { label: "Package Management", value: "pnpm" },
      { label: "Build Tools", value: "Vite" },
      { label: "Testing", value: "Vitest" },
      { label: "CSS Engine", value: "Tailwind CSS / UnoCSS" },
      { label: "Lint & Format", value: "ESLint + Prettier" },
      { label: "API Debugging", value: "Apifox" },
      { label: "Mock & Dev Utilities", value: "Faker.js" },
      { label: "Environment Management", value: "Dotenvx" },
      { label: "Version Control", value: "Git" },
      { label: "Container", value: "Docker" },
      { label: "Reverse Proxy", value: "Nginx" },
      { label: "Edge / CDN / DNS", value: "Cloudflare" },
    ],
  },
  {
    title: "Design",
    items: ["Figma", "Dribbble"],
  },
];

const failedTechIcons = ref<Set<string>>(new Set());

function getTechIconsForSection(sectionTitle: string) {
  return techIconGroups.find(group => group.titleEn === sectionTitle)?.items ?? [];
}

function onTechIconError(name: string) {
  if (failedTechIcons.value.has(name))
    return;

  const next = new Set(failedTechIcons.value);
  next.add(name);
  failedTechIcons.value = next;
}

function isTechIconFailed(name: string) {
  return failedTechIcons.value.has(name);
}

function techIconFallback(name: string) {
  const letters = name
    .split(/[\s./+-]+/)
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  if (letters.length >= 2)
    return letters;

  return name.slice(0, 2).toUpperCase();
}

function clearIntervals() {
  if (typingInterval) clearInterval(typingInterval);

  if (cursorInterval) clearInterval(cursorInterval);
}

function startIntroAnimation() {
  clearIntervals();
  typedName.value = "";
  showCursor.value = true;
  showContent.value = false;

  let index = 0;
  typingInterval = setInterval(() => {
    if (index < fullName.length) {
      typedName.value += fullName[index];
      index += 1;
      return;
    }

    clearInterval(typingInterval);
    typingInterval = undefined;
    showContent.value = true;
  }, 100);

  cursorInterval = setInterval(() => {
    showCursor.value = !showCursor.value;
  }, 530);
}

function scrollDown() {
  window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
}

onMounted(() => {
  startIntroAnimation();
});

onUnmounted(() => {
  clearIntervals();
});
</script>

<template>
  <div class="relative">
    <!-- Hero Section - Full viewport -->
    <section
      class="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <!-- Star field background -->
      <StarField />

      <!-- Subtle radial glow -->
      <div class="absolute inset-0 z-1 pointer-events-none">
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[rgba(60,180,255,0.03)] blur-[100px]"
        />
      </div>

      <!-- Vertical side text -->
      <div
        class="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden lg:block"
      >
        <span
          class="vertical-text text-lg tracking-[0.3em] uppercase opacity-30 select-none"
        >
          Yokoso, Watashi No Soul Society
        </span>
      </div>

      <!-- Main content - two column layout -->
      <div
        class="relative z-10 max-w-[1200px] w-full mx-auto px-6 flex flex-col lg:flex-row items-center lg:items-center gap-6 lg:gap-16"
      >
        <ASCII />

        <!-- Right side content -->
        <div class="text-center sm:text-left flex-1 min-w-0">
          <!-- Terminal prompt -->
          <div class="text-sm opacity-70 mb-3">
            <span class="text-[#42d392]">user@TLRK</span>
            <span class="opacity-60">:~$</span>
            <span class="ml-1">whoami</span>
          </div>

          <!-- Name with typing effect -->
          <h1
            class="text-4xl sm:text-5xl md:text-6xl font-700 font-sans tracking-tight mb-4 leading-tight"
          >
            <span class="opacity-60">></span>{{ typedName
            }}<span
              class="inline-block w-[0.6em] h-[3px] bg-[#22d3ee] ml-0.5 mb-[0.15em] align-bottom transition-opacity"
              :class="showCursor ? 'opacity-100' : 'opacity-0'"
            />
          </h1>

          <!-- Role tags -->
          <Transition name="fade-slide">
            <div
              v-if="showContent"
              class="text-sm sm:text-base opacity-80 mb-5 tracking-wide"
            >
              [ Full Stack Developer | Open Source Enthusiast ]
            </div>
          </Transition>

          <!-- Quote -->
          <Transition name="fade-slide">
            <blockquote
              v-if="showContent"
              class="border-l-3 border-[#6366f1] pl-4 my-6 text-sm sm:text-base opacity-85 italic"
            >
              "Code is poetry written for machines to dance to."
            </blockquote>
          </Transition>

          <!-- Comment -->
          <Transition name="fade-slide">
            <p v-if="showContent" class="text-sm opacity-50 mb-8">
              // writing about web, design, and open source
            </p>
          </Transition>

          <!-- Social icons -->
          <Transition name="fade-slide">
            <div
              v-if="showContent"
              class="flex items-center gap-3 mb-8 justify-center sm:justify-start"
            >
              <a
                v-for="link in socialLinks"
                :key="link.label"
                :href="link.href"
                target="_blank"
                rel="noopener"
                :title="link.label"
                class="w-10 h-10 rounded-full flex items-center justify-center glass-icon transition-all duration-300 hover:scale-110"
              >
                <div :class="link.icon" class="text-lg" />
              </a>
            </div>
          </Transition>

          <!-- Nav buttons -->
          <Transition name="fade-slide">
            <div
              v-if="showContent"
              class="flex flex-wrap gap-3 justify-center sm:justify-start"
            >
              <component
                :is="btn.disabled ? 'span' : 'RouterLink'"
                v-for="btn in navButtons"
                :key="btn.label"
                :to="btn.to"
                class="hero-btn group"
                :class="
                  btn.disabled
                    ? 'opacity-45 cursor-not-allowed pointer-events-none'
                    : ''
                "
              >
                <span>{{ btn.label }}</span>
                <span
                  v-if="!btn.disabled"
                  class="i-ri-arrow-right-line text-sm ml-1 transition-transform duration-300 group-hover:translate-x-1"
                />
              </component>
              <a :href="emailHref" class="hero-btn hero-btn--primary group">
                <span>Get in Touch</span>
                <span class="i-ri-mail-send-line text-sm ml-1" />
              </a>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Scroll indicator -->
      <Transition name="fade">
        <div
          v-if="showContent"
          class="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 cursor-pointer opacity-45 hover:opacity-85 transition-opacity"
          @click="scrollDown"
        >
          <div class="scroll-indicator">
            <div
              class="i-ri-arrow-down-s-line text-3xl sm:text-4xl animate-bounce drop-shadow-sm"
            />
          </div>
        </div>
      </Transition>
    </section>

    <!-- Below the fold: About -->
    <section class="relative z-10 max-w-680px mx-auto px-6 py-14">
      <div class="flex items-center gap-3 mb-8">
        <span class="i-ri-user-3-line text-lg opacity-40" />
        <h2 class="text-lg font-500 m-0 opacity-80">About Me</h2>
      </div>

      <div class="about-copy space-y-8">
        <div class="space-y-3">
          <p>
            Hi, I’m TLRK — a free and independent full-stack developer,
            open-source enthusiast, and FOSS advocator.
          </p>
          <p>
            My current focus is TypeScript-based full-stack
            development,including Vue 3 and its ecosystem, React,
            Node.js/NestJS, and Vitest.
          </p>
          <p>
            In my spare time, I continue exploring Rust and Svelte, while also
            learning Godot and Blender.
          </p>
        </div>

        <div class="space-y-3 text-sm opacity-86 leading-relaxed">
          <p>
            你好，我是 TLRK！我是一名自由、独立的全栈开发者，
            也是开源热爱者与自由软件运动支持者。
          </p>
          <p>
            目前我主要学习 TS 全栈开发，包含 Vue 3 及其生态、
            React、Node.js/NestJS 和 Vitest。
          </p>
          <p>
            业余时间我会继续学习 Rust、Svelte， 同时也在学习 Godot 与 Blender。
          </p>
        </div>

        <div class="pt-2 border-t border-base">
          <h3 class="text-sm font-600 tracking-wide uppercase opacity-70 mb-3">
            Tech Stack / 技术栈
          </h3>

          <div class="space-y-3">
            <details
              v-for="section in techStackSections"
              :key="section.title"
              class="tech-icons-disclosure"
            >
              <summary class="tech-icons-summary">
                <span>{{ section.title }}</span>
                <span class="i-ri-arrow-down-s-line tech-icons-chevron" />
              </summary>

              <div class="tech-icons-content">
                <ul v-if="section.rows" class="tech-stack-list">
                  <li
                    v-for="row in section.rows"
                    :key="`${section.title}-${row.label}`"
                  >
                    <strong>{{ row.label }}:</strong> {{ row.value }}
                  </li>
                </ul>
                <ul v-else-if="section.items" class="tech-stack-list">
                  <li
                    v-for="item in section.items"
                    :key="`${section.title}-${item}`"
                  >
                    {{ item }}
                  </li>
                </ul>

                <div
                  v-if="getTechIconsForSection(section.title).length > 0"
                  class="tech-icons-grid mt-2"
                >
                  <div
                    v-for="item in getTechIconsForSection(section.title)"
                    :key="`${section.title}-${item.name}`"
                    class="tech-icon-wrap"
                  >
                    <img
                      v-if="!isTechIconFailed(item.name)"
                      :src="item.icon"
                      :alt="item.name"
                      class="tech-icon-image"
                      loading="lazy"
                      decoding="async"
                      @error="onTechIconError(item.name)"
                    >
                    <span v-else class="tech-icon-fallback">
                      {{ techIconFallback(item.name) }}
                    </span>
                    <span class="tech-icon-tooltip">{{ item.name }}</span>
                  </div>
                </div>
              </div>
            </details>
          </div>

          <div class="my-5 border-t border-base opacity-60" />

          <h3 class="text-sm font-600 tracking-wide uppercase opacity-70 mb-3">
            Beyond Code / 代码之外
          </h3>

          <div class="space-y-3">
            <p>I love anime, games, and music 🎸.</p>
            <p>
              I enjoy exploring literature, film, history, politics, culture,
              society, philosophy, and religion, mythology, legends.
            </p>
            <p>I’m currently reading works by Žižek, Lacan, Marx, and Hegel.</p>
            <p>My English is improving; Japanese is currently on hold🕊️🕊️🕊️.</p>
          </div>

          <div class="space-y-3 text-sm opacity-86 leading-relaxed mt-5">
            <p>我热爱动漫、游戏，以及音乐 🎸。</p>
            <p>
              我也喜欢研究文学、电影、历史、政治、文化、社会、哲学、以及宗教神话传说相关的一切。
            </p>
            <p>目前在读：齐 / 拉 / 马 / 黑。</p>
            <p>英语在学，日本語咕了🕊️🕊️🕊️。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Below the fold: Recent posts -->
    <section class="relative z-10 max-w-680px mx-auto px-6 py-16">
      <div class="flex items-center gap-3 mb-8">
        <span class="i-ri-article-line text-lg opacity-40" />
        <h2 class="text-lg font-500 m-0 opacity-80">Recent Posts</h2>
      </div>
      <ListPosts :limit="5" :recent-months="6" />
      <div class="mt-8">
        <RouterLink
          to="/blog"
          class="text-sm font-mono opacity-30 hover:opacity-70 transition-opacity no-underline"
        >
          all posts →
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.glass-icon {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.glass-icon:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(100, 180, 255, 0.1);
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-family: "JetBrains Mono", monospace;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: inherit;
  text-decoration: none;
  transition: all 0.3s ease;
}

.hero-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(100, 180, 255, 0.08);
}

.hero-btn--primary {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
}

.hero-btn--primary:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.4);
}

.fade-slide-enter-active {
  transition: all 0.6s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active {
  transition: opacity 0.6s ease 0.5s;
}

.fade-enter-from {
  opacity: 0;
}

.about-copy {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--c-text);
}

.about-copy p {
  margin: 0;
}

.tech-stack-section {
  display: grid;
  gap: 0.35rem;
}

.tech-stack-list {
  margin: 0;
  padding-left: 1.15rem;
  display: grid;
  gap: 0.28rem;
  opacity: 0.9;
}

.tech-stack-list li {
  line-height: 1.65;
}

:root:not(.dark) .glass-icon {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.1);
}

:root:not(.dark) .glass-icon:hover {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

:root:not(.dark) .hero-btn {
  border-color: rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.03);
}

:root:not(.dark) .hero-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.04);
}

:root:not(.dark) .hero-btn--primary {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(0, 0, 0, 0.18);
}

.tech-icons-disclosure {
  border: 1px dashed var(--c-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  padding: 0.25rem 0.75rem 0.65rem;
}

.tech-icons-summary {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.5rem 0;
  font-size: 0.86rem;
  opacity: 0.86;
  user-select: none;
}

.tech-icons-summary::-webkit-details-marker {
  display: none;
}

.tech-icons-chevron {
  transition: transform 0.25s ease;
  opacity: 0.72;
}

.tech-icons-disclosure[open] .tech-icons-chevron {
  transform: rotate(180deg);
}

.tech-icons-content {
  margin-top: 0.3rem;
  display: grid;
  gap: 0.9rem;
}

.tech-icons-group-title {
  margin: 0 0 0.45rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  opacity: 0.64;
}

.tech-icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  gap: 0.65rem 0.8rem;
}

.tech-icon-wrap {
  position: relative;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.tech-icon-wrap:hover {
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-1px);
}

.tech-icon-image {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.tech-icon-fallback {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  font-size: 0.62rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.02em;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.08);
}

.tech-icon-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(3px);
  padding: 0.32rem 0.5rem;
  border-radius: 8px;
  background: #fff;
  color: #111;
  font-size: 0.74rem;
  line-height: 1;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 20;
}

.tech-icon-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #fff;
}

.tech-icon-wrap:hover .tech-icon-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

:root:not(.dark) .tech-icons-disclosure {
  background: rgba(0, 0, 0, 0.02);
}

:root:not(.dark) .tech-icon-wrap:hover {
  border-color: rgba(0, 0, 0, 0.14);
  background: rgba(0, 0, 0, 0.03);
}

:root:not(.dark) .tech-icon-fallback {
  background: rgba(0, 0, 0, 0.06);
}
</style>

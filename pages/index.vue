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
            <p>
              <strong>Frontend Engineering:</strong> Vue 3, React, Vue Router,
              Pinia, VueUse, VeeValidate, Yup, Vue Toastification, Faker.js
            </p>
            <p>
              <strong>Backend & API:</strong> Node.js, NestJS, Express.js,
              GraphQL, RESTful API, dotenv
            </p>
            <p>
              <strong>Data Layer:</strong> Supabase, PostgreSQL, Prisma,
              Sequelize, Drizzle
            </p>
            <p>
              <strong>UI & Design Systems:</strong> shadcn/ui, DaisyUI,
              PrimeVue, Inspira UI, Hero UI, Radix UI, Headless UI, Fluent UI,
              Base UI, Material UI, Ant Design, Floating UI
            </p>
            <p>
              <strong>Build, Tooling & Quality:</strong> pnpm, Vite, Vitest,
              Tailwind CSS, UnoCSS, Nodemon, ESLint, Prettier
            </p>
            <p>
              <strong>Infrastructure & Delivery:</strong> Cloudflare, Nginx,
              Docker
            </p>
            <p><strong>Design:</strong> Figma</p>
          </div>

          <div class="space-y-3 text-sm opacity-86 leading-relaxed mt-5">
            <p>
              <strong>前端工程：</strong>Vue 3、React、Vue
              Router、Pinia、VueUse、VeeValidate、Yup、Vue
              Toastification、Faker.js
            </p>
            <p>
              <strong>后端与接口：</strong
              >Node.js、NestJS、Express.js、GraphQL、RESTful API、dotenv
            </p>
            <p>
              <strong>数据层：</strong
              >Supabase、PostgreSQL、Prisma、Sequelize、Drizzle
            </p>
            <p>
              <strong>UI 与组件体系：</strong
              >shadcn/ui、DaisyUI、PrimeVue、Inspira UI、Hero UI、Radix
              UI、Headless UI、Fluent UI、Base UI、Material UI、Ant
              Design、Floating UI
            </p>
            <p>
              <strong>构建、工具与规范：</strong>pnpm、Vite、Vitest、Tailwind
              CSS、UnoCSS、Nodemon、ESLint、Prettier
            </p>
            <p><strong>基础设施与交付：</strong>Cloudflare、Nginx、Docker</p>
            <p><strong>设计协作：</strong>Figma</p>
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
</style>

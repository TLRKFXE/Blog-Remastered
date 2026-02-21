import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
} from "unocss";

export default defineConfig({
  shortcuts: [
    ["bg-base", "bg-white dark:bg-[#050505]"],
    ["text-base", "text-[#2c3e50] dark:text-[#d4d4d4]"],
    ["text-secondary", "text-[#6a8bad] dark:text-[#888888]"],
    ["border-base", "border-[#e5e5e5] dark:border-[#222222]"],
    [
      "nav-link",
      "opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer",
    ],
    [
      "prose-link",
      "text-inherit border-b border-current border-opacity-20 hover:border-opacity-60 decoration-none transition-all duration-300",
    ],
    [
      "icon-btn",
      "inline-block cursor-pointer select-none opacity-50 transition-all duration-300 ease-in-out hover:opacity-100",
    ],
    ["glass-panel", "backdrop-blur-12px backdrop-saturate-180"],
  ],

  rules: [["slide-enter-content", {}]],

  theme: {
    colors: {
      brand: {
        DEFAULT: "#3eaf7c",
        dark: "#42d392",
      },
    },
  },

  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
    presetWebFonts({
      fonts: {
        sans: "Montserrat:400;500;600;700;800",
        mono: "JetBrains Mono:300;400;500;600;700",
        homemade: "Homemade Apple:400",
      },
    }),
  ],

  transformers: [transformerDirectives()],

  safelist: [
    "i-ri-github-fill",
    "i-ri-twitter-x-fill",
    "i-ri-sun-line",
    "i-ri-moon-line",
    "i-ri-arrow-up-line",
    "i-ri-arrow-right-line",
    "i-ri-arrow-down-s-line",
    "i-ri-article-line",
    "i-ri-code-s-slash-line",
    "i-ri-user-line",
    "i-ri-quill-pen-line",
    "i-ri-rocket-line",
    "i-ri-palette-line",
    "i-ri-terminal-box-line",
    "i-ri-telegram-fill",
    "i-ri-bilibili-fill",
    "i-ri-ubuntu-fill",
    "i-ri-steam-fill",
    "i-ri-mail-fill",
    "i-ri-mail-line",
    "i-ri-mail-send-line",
    "i-carbon-logo-github",
  ],
});

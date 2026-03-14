/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        editorial_light: {
          "primary": "#1a1a18",
          "primary-content": "#FAFAF8",
          "secondary": "#6b6a66",
          "secondary-content": "#FAFAF8",
          "accent": "#6b6a66",
          "accent-content": "#FAFAF8",
          "neutral": "#6b6a66",
          "neutral-content": "#FAFAF8",
          "base-100": "#FAFAF8",
          "base-200": "#f0efec",
          "base-300": "#e5e3de",
          "base-content": "#1a1a18",
          "info": "#3b82f6",
          "info-content": "#ffffff",
          "success": "#22c55e",
          "success-content": "#ffffff",
          "warning": "#f59e0b",
          "warning-content": "#ffffff",
          "error": "#ef4444",
          "error-content": "#ffffff",
        },
      },
      {
        editorial_dark: {
          "primary": "#f0efec",
          "primary-content": "#131312",
          "secondary": "#9a9994",
          "secondary-content": "#131312",
          "accent": "#9a9994",
          "accent-content": "#131312",
          "neutral": "#9a9994",
          "neutral-content": "#131312",
          "base-100": "#131312",
          "base-200": "#1c1c1a",
          "base-300": "#252523",
          "base-content": "#f0efec",
          "info": "#3b82f6",
          "info-content": "#ffffff",
          "success": "#22c55e",
          "success-content": "#ffffff",
          "warning": "#f59e0b",
          "warning-content": "#ffffff",
          "error": "#ef4444",
          "error-content": "#ffffff",
        },
      },
    ],
    logs: false,
  }
}

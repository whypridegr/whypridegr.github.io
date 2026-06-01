// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Static site. React islands via @astrojs/react; Tailwind v4 via the Vite plugin.
// `site` powers the sitemap and canonical URLs, so keep it accurate.
export default defineConfig({
  site: "https://whypride.gr",
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});

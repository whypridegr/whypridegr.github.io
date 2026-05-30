// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// Static site. React islands via @astrojs/react; Tailwind v4 via the Vite plugin.
export default defineConfig({
  site: "https://whypride.gr",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});

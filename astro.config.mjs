import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: "https://dg.scanallgoods.com",
  base: "/",
  integrations: [icon(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      sourcemap: false
    }
  }
});

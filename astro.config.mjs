// @ts-check
import { defineConfig } from 'astro/config';

import solidJs from '@astrojs/solid-js';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs(), mdx()],
  site: `https://sharkaccino.com`,
  server: {
    port: 3000
  }
});
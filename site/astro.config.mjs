// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  base: '/adrianwedd/',
  site: 'https://adrianwedd.github.io',
  build: {
    inlineStylesheets: 'auto'
  }
});

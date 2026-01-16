// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  base: '/',
  site: 'https://github.adrianwedd.com',
  build: {
    inlineStylesheets: 'auto'
  }
});

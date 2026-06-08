import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://fiestalok.fr',
  output: 'server',
  adapter: vercel({
    isr: {
      // Cache les pages SSR pendant 1h, revalidation en arrière-plan
      expiration: 60 * 60,
      // Les routes dynamiques utilisateur ne doivent pas être cachées
      exclude: ['/devis', '/suivi'],
    },
  }),
  integrations: [react(), sitemap()],
});

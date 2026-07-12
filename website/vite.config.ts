import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import {
  absoluteAssetUrl,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_NAME,
  SITE_URL,
  YANOVIAN_LLC_NAME,
} from './site-meta';
import enSeo from './src/locales/en/seo.json';

const base = process.env.VITE_BASE_PATH ?? '/';
const ogImage = absoluteAssetUrl('og-image.png');

export default defineConfig({
  base,
  plugins: [
    react(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: enSeo.title,
          description: enSeo.description,
          canonical: SITE_URL,
          ogImage,
          ogImageAlt: enSeo.ogImageAlt,
          ogImageWidth: OG_IMAGE_WIDTH,
          ogImageHeight: OG_IMAGE_HEIGHT,
          siteName: SITE_NAME,
          authorName: YANOVIAN_LLC_NAME,
          locale: 'en_US',
        },
      },
    }),
  ],
  server: {
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});

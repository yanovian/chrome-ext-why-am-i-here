# Why Am I Here? marketing site

Landing page for [Why Am I Here?](https://github.com/yanovian/chrome-ext-why-am-i-here). Vite + React + TypeScript.

**Live URL:** https://yanovian.github.io/chrome-ext-why-am-i-here/

## Commands (from repo root)

| Make | What it does |
|------|----------------|
| `make website-install` | Install `website/` dependencies |
| `make website-dev` | Dev server at http://localhost:5173/ (base `/`) |
| `make website-build` | Production build to `website/dist/` |
| `make website-preview` | Build + preview at http://localhost:4173/chrome-ext-why-am-i-here/ |
| `make website-clean` | Remove `dist/` and copied `public/` assets |
| `make website-lint-i18n` | Check locale JSON keys match `en/` |
| `make website-lint-i18n-fix` | Add missing locale keys as `""` |
| `make website-og-images` | Regenerate committed OG share images (`static/og/*.png`) |

## Commands (this folder)

```bash
pnpm install
pnpm dev
pnpm lint-i18n
pnpm lint-i18n-fix
pnpm build
pnpm preview
```

Assets copy from extension `public/icon/` on `predev` and `prebuild`. Committed share images live in `static/og-image.png` and `static/og/*.png`. Regenerate with `make website-og-images` after SEO copy changes.

**Languages:** 39 locales in `src/locales/<code>/` (`marketing.json`, `common.json`, `legal.json`, `seo.json`). RTL for `ar` and `fa`. Edit English in `src/locales/en/`, run `pnpm lint-i18n-fix` to sync keys, translate, then `pnpm lint-i18n`.

## GitHub Pages

1. Repo **Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**.
2. Push to `master` or run the **Deploy website** workflow manually.

Deploy workflow: `.github/workflows/pages.yml`.

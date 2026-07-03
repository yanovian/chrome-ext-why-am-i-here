# Why Am I Here?

A privacy-first Chrome extension that helps you stay intentional while browsing.

When you open a new tab, you can optionally set a goal like **"Looking for AWS pricing"**. Later—if your tab count grows and you have opened many related tabs—the extension surfaces a gentle check-in:

> You opened 17 tabs related to AWS pricing. Goal completed?

Built for people with ADHD, researchers, developers, and students who want a nudge before rabbit holes take over.

## Features

- **Optional goal capture** in the extension popup (never forced)
- **Local-only storage** — no accounts, analytics, or remote servers
- **Gentle check-ins** via extension badge and popup (no notification permission)
- **Configurable thresholds** — check-in interval, total tab count, minimum related tabs
- **Minimal permissions** — only `tabs` and `storage`

## Permissions

| Permission | Why |
|------------|-----|
| `tabs` | Count open tabs and read titles/URLs to match your stated intent |
| `storage` | Persist settings and session state locally |

No host permissions, no `notifications`, no `history`, no network access.

## Quick start (development)

```bash
pnpm install
pnpm dev
```

Open the extension popup from the toolbar to set a goal. New tabs use Chrome's default page.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` | Production build |
| `pnpm zip` | Create Chrome Web Store zip |
| `pnpm test` | Run unit tests |
| `pnpm typecheck` | TypeScript check |

## How it works (high level)

1. Open the extension popup and set a goal (e.g. "AWS pricing").
2. A background service worker tracks related tabs and **active time** — only minutes spent on related tabs in a focused window count.
3. After enough active minutes (default 30), if you have many tabs open and several related to your goal, a check-in appears.
4. You can mark the goal complete, keep going (snooze), or dismiss.

See [`_doc/architecture.md`](./_doc/architecture.md) for a detailed technical overview.

## Publishing

See [`_doc/release.md`](./_doc/release.md) for Chrome Web Store release steps and CI/CD details.

## Logo

The extension icon lives in `public/icon/` (generated from `assets/logo.png`).

## Tech stack

- [WXT](https://wxt.dev/) — modern Manifest V3 extension framework (TypeScript + Vite)
- [Vitest](https://vitest.dev/) — unit tests
- GitHub Actions — CI on PR/push, releases on version tags

## License

MIT

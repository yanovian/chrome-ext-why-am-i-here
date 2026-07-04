# Why Am I Here?

A privacy-first Chrome extension that helps you stay intentional while browsing.

**[⬇️ Install from the Chrome Web Store](https://chromewebstore.google.com/detail/why-am-i-here/oljicgnpidagkgpnpcdihcbdkimibefl)**

Set a goal in the popup — for example **"AWS pricing"** — and the extension watches how you actually spend your time and tabs. When something looks off, it gives you a gentle nudge via the extension badge and popup (no system notifications).

Built for people with ADHD, researchers, developers, and students who want help staying on task *and* noticing when a focused search has turned into a rabbit hole.

## Why two kinds of reminders?

Browsing fails in two different ways, and ADHD makes both common:

| Problem | What it feels like | What the extension does |
|---------|-------------------|-------------------------|
| **Distraction** | You sat down to look up AWS pricing, but 20 minutes later you're on Reddit, email, and random tabs | **Focus nudge** — reminds you to get back on goal when you've spent time on off-goal tabs and they outnumber on-goal ones |
| **Rabbit hole** | You *are* on topic, but you've opened 40 AWS tabs and lost the plot | **Rabbit-hole check-in** — asks whether your goal is done when you've spent a long time on-goal with many related tabs open |

Most tools only catch one of these. Distraction blockers punish off-task browsing but don't help when you're *too* deep on the right topic. Timer apps don't know whether your tabs match your intent. **Why Am I Here?** tracks both **time** and **tab alignment** against the goal you set, so the nudge matches what actually went wrong.

## Features

- **Optional goal capture** in the extension popup (never forced)
- **Dual reminders** — distraction nudges *and* rabbit-hole check-ins
- **Active time tracking** — separate counters for on-goal vs off-goal minutes (only while the browser window is focused)
- **Tab alignment** — tracks on-goal vs off-goal tabs since your goal was set
- **Local-only storage** — no accounts, analytics, or remote servers
- **Gentle nudges** via extension badge (`!`) and popup — no notification permission
- **Configurable thresholds** for both reminder types (see Settings in the popup)
- **Minimal permissions** — `tabs`, `storage`, and `alarms` only

## Permissions

| Permission | Why |
|------------|-----|
| `tabs` | Count open tabs and read titles/URLs to match your stated intent |
| `storage` | Persist settings and session state locally |
| `alarms` | Periodically evaluate focus and check-in conditions while a goal is active |

No host permissions, no `notifications`, no `history`, no network access.

**Privacy policy:** [PRIVACY.md](./PRIVACY.md) — we do not collect data; everything stays local on your device.  
Public URL for the Chrome Web Store: https://github.com/yanovian/chrome-ext-why-am-i-here/blob/master/PRIVACY.md

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
    | `pnpm icons` | Regenerate extension icons from `scripts/generate-icons.py` |
    | `pnpm test` | Run unit tests |
| `pnpm typecheck` | TypeScript check |

## How it works (high level)

1. Open the extension popup and set a goal (e.g. "AWS pricing").
2. A background service worker tracks which tabs match your goal and how long you spend on them vs off-goal tabs (only while the browser window is focused).
3. **Distraction nudge** fires when you've been off-goal long enough *and* off-goal tabs outnumber on-goal ones. The popup asks you to refocus; **Back on track** snoozes the nudge.
4. **Rabbit-hole check-in** fires when you've spent enough on-goal time *and* opened enough related tabs (plus a minimum total tab count). The popup asks if your goal is complete; you can finish, keep going (snooze), or dismiss.
5. When a nudge is ready, the extension icon shows **!** — open the popup to respond. There are no OS-level notifications.

### Default thresholds (configurable in Settings)

**Distraction nudges**
- 5 minutes on off-goal tabs
- At least 2 off-goal tabs open, and more off-goal than on-goal

**Rabbit-hole check-ins**
- 30 minutes on on-goal tabs
- At least 40 open tabs total
- At least 3 on-goal tabs

See [`_doc/architecture.md`](./_doc/architecture.md) for a detailed technical overview.

## Publishing

See [`_doc/release.md`](./_doc/release.md) for Chrome Web Store release steps and CI/CD details.

## Logo

The extension icon is a bold **?** on teal — simple and readable at 16px. Icons live in `public/icon/`; regenerate with `pnpm icons` (see `scripts/generate-icons.py`).

## Tech stack

- [WXT](https://wxt.dev/) — modern Manifest V3 extension framework (TypeScript + Vite)
- [Vitest](https://vitest.dev/) — unit tests
- GitHub Actions — CI on PR/push, releases on version tags

## License

MIT

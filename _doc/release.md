# Release & Publishing Guide

This document covers local packaging, automated releases, and publishing to the Chrome Web Store.

## Versioning

The extension version comes from `package.json` (`version` field). WXT copies it into the generated manifest.

Use [Semantic Versioning](https://semver.org/):

- **PATCH** — bug fixes
- **MINOR** — new features, backward compatible
- **MAJOR** — breaking changes

## Local build & zip

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm zip          # Chrome
pnpm zip:firefox  # Firefox (optional)
```

Artifacts appear in `.output/`:

- `why-am-i-here-<version>-chrome.zip`
- `why-am-i-here-<version>-firefox.zip`

Load unpacked for manual QA:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `.output/chrome-mv3`

## CI pipeline (`.github/workflows/ci.yml`)

Runs on:

- Push to `master` / `main`
- Pull requests targeting `master` / `main`

Steps:

1. `pnpm install --frozen-lockfile`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`
5. `pnpm zip`
6. Upload zip as a GitHub Actions artifact

Use the artifact from a green PR build for manual store submission before tagging.

## Release pipeline (`.github/workflows/release.yml`)

Triggered by pushing a git tag matching `v*.*.*` (e.g. `v1.0.0`).

Steps:

1. Install dependencies
2. Run tests
3. Build Chrome + Firefox zips
4. Create a GitHub Release with both zips attached and auto-generated notes

### Creating a release

```bash
# Ensure main is green and changes are merged
git checkout master
git pull

# Bump version in package.json, commit
pnpm version patch   # or minor / major

# Push commit + tag
git push origin master --follow-tags
```

The release workflow publishes assets automatically.

## Chrome Web Store submission

### Prerequisites

1. [Chrome Web Store Developer account](https://chrome.google.com/webstore/devconsole) ($5 one-time fee)
2. A green CI build or local `pnpm zip` artifact
3. Store listing assets:
   - Icon 128×128 (`public/icon/128.png`)
   - Screenshots (1280×800 or 640×400 recommended)
   - Short and detailed descriptions (see README)

### Upload steps

1. Open the [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. **New item** (first release) or select existing item
3. Upload `.output/why-am-i-here-<version>-chrome.zip`
4. Fill listing details:
   - **Name:** Why Am I Here?
   - **Category:** Productivity
   - **Privacy:** Single purpose, no remote code, no data collection
5. Declare permissions justification:
   - `tabs` — count tabs and read titles/URLs to match stated browsing intent
   - `storage` — save settings and session state locally
6. Submit for review

### Review tips

- Emphasize **local-only** data handling in the privacy form.
- Mention the extension does **not** request host permissions or network access.
- Provide a short screen recording showing: new tab intent → browsing → check-in popup.

## Firefox Add-ons (optional)

The project also builds a Firefox zip (`pnpm zip:firefox`). Submit at [addons.mozilla.org](https://addons.mozilla.org/developers/) following their Manifest V3 guidelines.

## Post-release checklist

- [ ] Verify GitHub Release contains both zips
- [ ] Install from store listing (unlisted first if desired)
- [ ] Smoke test: new tab intent, tab accumulation, check-in, snooze, complete
- [ ] Confirm badge clears after responding to check-in

## Rollback

Chrome Web Store:

1. Developer Dashboard → your item → **Package**
2. Roll back to a previous approved version if a regression ships

Git:

```bash
git tag -d v1.0.1          # local only
git push origin :refs/tags/v1.0.1  # delete remote tag if needed
```

Prefer forwarding fixes with a new patch tag instead of rewriting published tags.

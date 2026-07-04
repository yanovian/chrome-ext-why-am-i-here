# Contributing to Why Am I Here?

Thanks for helping make Why Am I Here? better! This guide keeps contributions
simple and consistent.

## The short version

1. **Open an issue first.** Every change starts with an issue — a
   [Bug report](https://github.com/yanovian/chrome-ext-why-am-i-here/issues/new/choose)
   or a [Feature request](https://github.com/yanovian/chrome-ext-why-am-i-here/issues/new/choose).
2. **One issue per PR.** Every pull request must reference its issue with
   `Closes #<number>` in the description.
3. **Open PRs as drafts.** Keep a PR in **Draft** until it's genuinely ready,
   then click **Ready for review**.
4. **Green before review.** `pnpm typecheck` and `pnpm test` must pass.

## Workflow

### 1. Open an issue

Pick the right template so we capture what we need up front:

- **Bug** — what happened, step-by-step reproduction, expected behavior, a
  screenshot/recording, and your browser + OS + extension version.
- **Feature** — who it's for, what we need, and why (the problem it solves).

Wait for a quick 👍 on the issue before starting large work, so no one builds
something that won't be merged.

### 2. Create a branch

Branch off `master` with a short, descriptive name:

```bash
git checkout -b fix/badge-flicker        # bug fix
git checkout -b feat/custom-thresholds   # new feature
```

### 3. Develop

```bash
pnpm install     # first time
pnpm dev         # Chrome dev server with hot reload
```

Before you push, make sure everything is green:

```bash
pnpm typecheck
pnpm test
# or, in one shot:
make check
```

See the [README](./README.md#scripts) for the full list of scripts.

### 4. Open a Draft pull request

1. Push your branch and open the PR **as a draft**.
2. Reference the issue in the description: `Closes #123`.
3. Fill in the PR template and tick the checklist.
4. When it's ready, click **Ready for review** — not before.

## Commit messages

Keep them short and in the imperative mood, describing the *why*:

```
Fix duplicate badge flash on repeated nudges
Add configurable rabbit-hole tab threshold
```

## Code style

- **TypeScript, strict mode.** No `any` unless truly unavoidable.
- **Pure logic gets a test.** Anything in `utils/` that transforms data should
  have a Vitest test in `tests/`.
- **Keep comments meaningful.** Explain intent or trade-offs, not the obvious.
- **Minimal permissions.** Don't add Chrome permissions without a strong reason;
  they're part of Why Am I Here?'s privacy promise (`tabs`, `storage`, and
  `alarms` only).

## Icons

The extension icons are generated, not hand-edited. Update
[`scripts/generate-icons.py`](./scripts/generate-icons.py) and run `pnpm icons`
to regenerate the files in `public/icon/`.

## License

By contributing, you agree that your contributions are licensed under the
project's [MIT License](./LICENSE).

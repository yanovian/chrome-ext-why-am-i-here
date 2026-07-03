# Privacy Policy — Why Am I Here?

**Last updated:** July 3, 2026

**Privacy policy URL (for Chrome Web Store):**  
https://github.com/yanovian/chrome-ext-why-am-i-here/blob/master/PRIVACY.md

## Summary

**Why Am I Here? does not collect your data.** There is no account, no analytics, no backend, and no transmission of your information to us or to third parties. Everything the extension uses stays **on your device**, in your browser’s local storage.

## Who we are

Why Am I Here? is an open-source Chrome extension that helps you stay intentional while browsing. The source code is public in this repository.

## What the extension stores locally

While you use the extension, it may save the following **only on your computer** using Chrome’s `storage` API (`chrome.storage.local`):

- The **goal** you type (for example, “AWS pricing”)
- Your **reminder settings** (thresholds for distraction and rabbit-hole nudges)
- **Session state** for your current goal (such as tab counts and minutes spent on-goal vs off-goal)

While a goal is **active**, the extension also reads **open tab titles and URLs** in your browser to decide whether each tab matches your goal. That information is used **in memory and for local session stats only** — it is not uploaded anywhere.

## What we do not do

- We do **not** collect, store, or receive your data on any server operated by us.
- We do **not** sell, rent, or share your data with third parties.
- We do **not** use your data for advertising, credit decisions, or lending.
- We do **not** use the Chrome `history` API or build a log of every site you have ever visited.
- We do **not** load or run code from remote servers (all code is bundled in the extension package).

## Permissions and why they are needed

| Permission | Purpose |
|------------|---------|
| `tabs` | See open tab titles and URLs to match your stated goal and count related vs unrelated tabs |
| `storage` | Save your goal, settings, and session state on your device |
| `alarms` | Run a light periodic check (about once per minute) while a goal is active to update focus time and reminders |

The extension requests **no host permissions** and does **not** access the network.

## Data retention and deletion

Data remains in your browser until you change or clear it. You can:

- **End a goal** or **replace a goal** in the extension popup
- **Remove the extension**, which deletes its local storage
- **Clear extension data** in `chrome://extensions` → Why Am I Here? → Details → Clear data

## Children

This extension is not directed at children under 13, and we do not knowingly collect personal information from anyone (we do not collect personal information at all).

## Changes

If this policy changes, we will update this file in the public repository and change the “Last updated” date above.

## Open source

Source code: https://github.com/yanovian/chrome-ext-why-am-i-here

## Contact

For privacy questions about this extension, open an issue on the GitHub repository or contact the publisher email listed on the Chrome Web Store listing.

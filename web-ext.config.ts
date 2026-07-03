import { resolve } from 'node:path';
import { defineWebExtConfig } from 'wxt';

export default defineWebExtConfig({
  // Keep the same Chrome profile between `pnpm dev` runs so storage persists.
  chromiumArgs: [`--user-data-dir=${resolve('.wxt/chrome-data')}`],
});

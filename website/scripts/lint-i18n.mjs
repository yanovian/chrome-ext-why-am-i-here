#!/usr/bin/env node
/**
 * Check website locale JSON files match English keys exactly (no missing, no extra).
 *
 *   node scripts/lint-i18n.mjs          # check only, exit 1 on mismatch
 *   pnpm lint-i18n-fix                 # add missing keys as "" and warn
 *
 * English source of truth: src/locales/en/*.json
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES_ROOT = join(ROOT, 'src', 'locales');
const NAMESPACES = ['marketing', 'common', 'legal', 'seo'];
const fix = process.argv.includes('--fix');

function flatKeys(value, prefix = '') {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const keys = [];
    for (const [key, child] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${key}` : key;
      keys.push(...flatKeys(child, path));
    }
    return keys;
  }
  return prefix ? [prefix] : [];
}

function setNestedValue(target, dottedKey, value) {
  const parts = dottedKey.split('.');
  let current = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object' || Array.isArray(current[part])) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

const enKeys = Object.fromEntries(
  NAMESPACES.map((ns) => {
    const path = join(LOCALES_ROOT, 'en', `${ns}.json`);
    if (!existsSync(path)) {
      console.error(`[lint-i18n] missing English file: ${path}`);
      process.exit(1);
    }
    return [ns, new Set(flatKeys(readJson(path)))];
  }),
);

const localeDirs = readdirSync(LOCALES_ROOT)
  .filter((name) => !name.startsWith('.') && existsSync(join(LOCALES_ROOT, name)))
  .sort();

let hasErrors = false;
let fixedCount = 0;

for (const locale of localeDirs) {
  if (locale === 'en') {
    continue;
  }

  for (const ns of NAMESPACES) {
    const path = join(LOCALES_ROOT, locale, `${ns}.json`);
    if (!existsSync(path)) {
      console.error(`[lint-i18n] ${locale}/${ns}.json: file missing`);
      hasErrors = true;
      continue;
    }

    const json = readJson(path);
    const keys = new Set(flatKeys(json));
    const missing = [...enKeys[ns]].filter((key) => !keys.has(key)).sort();
    const extra = [...keys].filter((key) => !enKeys[ns].has(key)).sort();

    if (fix && missing.length > 0) {
      for (const key of missing) {
        setNestedValue(json, key, '');
        console.warn(`[lint-i18n] ${locale}/${ns}.json: added missing key "${key}" as ""`);
        fixedCount += 1;
      }
      writeJson(path, json);
    }

    for (const key of missing) {
      if (!fix) {
        console.error(`[lint-i18n] ${locale}/${ns}.json: missing key "${key}"`);
        hasErrors = true;
      }
    }

    for (const key of extra) {
      console.error(`[lint-i18n] ${locale}/${ns}.json: extra key "${key}" (not in en)`);
      hasErrors = true;
    }
  }
}

if (fix && fixedCount > 0) {
  console.warn(`[lint-i18n] added ${fixedCount} missing key(s). Fill in translations, then run lint-i18n again.`);
}

if (hasErrors) {
  process.exit(1);
}

console.log(`[lint-i18n] ${localeDirs.length} locales OK (${NAMESPACES.length} namespaces each, keys match en)`);

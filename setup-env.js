#!/usr/bin/env node
/**
 * setup-env.js — Local development environment setup
 *
 * Generates dashboard/src/environments/environment.ts from the template.
 * Usage:
 *   node setup-env.js
 *
 * The script reads variables from a .env file in the repo root (git-ignored).
 * Copy .env.example → .env and fill in your values before running.
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, 'dashboard/src/environments/environment.template.ts');
const OUTPUT_PATH   = path.join(__dirname, 'dashboard/src/environments/environment.ts');
const ENV_FILE_PATH = path.join(__dirname, '.env');

// --- Load .env file if it exists ---
const envVars = {};
if (fs.existsSync(ENV_FILE_PATH)) {
  const lines = fs.readFileSync(ENV_FILE_PATH, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key   = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    envVars[key] = value;
  }
  console.log('✅ Loaded variables from .env');
} else {
  console.warn('⚠️  No .env file found — using only process.env variables');
  console.warn('   Copy .env.example → .env and fill in your values.\n');
}

// Merge with process.env (process.env takes precedence)
const vars = { ...envVars, ...process.env };

// --- Substitute placeholders ---
let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
template = template.replace(/\$\{([^}]+)\}/g, (match, key) => {
  if (vars[key] !== undefined) return vars[key];
  console.warn(`⚠️  Variable "${key}" not found — leaving empty string`);
  return '';
});

fs.writeFileSync(OUTPUT_PATH, template, 'utf8');
console.log(`✅ Generated: ${OUTPUT_PATH}`);

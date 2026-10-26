import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');

test('workspace exposes required configuration fields', () => {
  for (const field of ['botName', 'role', 'goal', 'instructions', 'restrictions', 'context', 'success', 'riskLevel']) {
    assert.match(html, new RegExp(`id="${field}"`), `missing ${field}`);
  }
});

test('configuration keeps planning separate from execution', () => {
  assert.match(js, /phaseEnforcedMode:\s*'plan_only'/);
  assert.match(js, /requiresExplicitApprovalForExternalActions:\s*true/);
  assert.match(js, /status:\s*'planned'/);
});

test('prototype supports local save and JSON export without requiring a provider key', () => {
  assert.match(js, /localStorage\.setItem/);
  assert.match(js, /application\/json/);
  assert.doesNotMatch(js, /AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{20,}/);
});

test('layout includes responsive styling and reduced-motion support', () => {
  assert.match(css, /@media\(max-width:620px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

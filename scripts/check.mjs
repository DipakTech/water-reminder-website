import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique.');
for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const value = match[1];
  if (value === '#' || /^https?:/.test(value)) continue;
  if (value.startsWith('#')) assert(ids.includes(value.slice(1)), `Missing anchor: ${value}`);
  else assert((await stat(path.join(root, value))).isFile(), `Missing asset: ${value}`);
}
for (const match of html.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
  for (const id of match[1].split(' ')) assert(ids.includes(id), `Missing accessible target: ${id}`);
}
assert(html.includes('illustrative quotes, not customer reviews'), 'Testimonial placeholders must be disclosed.');
assert((await readFile(path.join(root, 'styles.css'), 'utf8')).includes('prefers-reduced-motion'), 'Reduced motion support is required.');
console.log('Passed: HTML anchors, assets, ARIA relationships, testimonial disclosure, reduced motion.');

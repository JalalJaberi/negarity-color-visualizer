import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url)));
assert.match(pkg.version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/);
for (const metadata of [lock, lock.packages['']]) {
  assert.equal(metadata.name, pkg.name, 'Package and lockfile names must match');
  assert.equal(metadata.version, pkg.version, 'Package and lockfile versions must match');
}
const tag = process.argv[2];
if (tag) assert.equal(tag, `v${pkg.version}`, 'Release tag must match package.json');
console.log(`${pkg.name}@${pkg.version}${tag ? ` matches ${tag}` : ': version metadata matches'}`);

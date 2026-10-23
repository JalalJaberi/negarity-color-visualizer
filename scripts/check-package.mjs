import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
// prepack rebuilds the package before inspecting the actual npm file list.
const output = execFileSync(npm, ['pack', '--dry-run', '--json'],
  { cwd: root, encoding: 'utf8' });
// Older npm versions print lifecycle output before their JSON result.
const jsonStart = output.search(/^\[\s*\{/m);
assert(jsonStart >= 0, 'npm pack did not return a JSON file list');
const [packed] = JSON.parse(output.slice(jsonStart));
assert.equal(packed.name, pkg.name);
assert.equal(packed.version, pkg.version);
const files = new Set(packed.files.map(file => file.path));
for (const path of [pkg.main, pkg.module, pkg.types, 'dist/style.css',
  'dist/circle.png', 'dist/horseshoe.png', 'README.md', 'LICENSE', 'THIRD_PARTY_LICENSES.txt', 'package.json']) {
  assert(files.has(path), `Missing published file: ${path}`);
}
for (const path of files) {
  assert(!path.endsWith('.map'), `Source map should not be published: ${path}`);
  assert(!/(^|\/)(src|examples|tests|docs|node_modules|\.github|\.aws|\.agents|\.codex)(\/|$)/.test(path),
    `Development file should not be published: ${path}`);
}
console.log(`Validated ${packed.name}@${packed.version}: ${files.size} files, ${packed.size} packed bytes`);

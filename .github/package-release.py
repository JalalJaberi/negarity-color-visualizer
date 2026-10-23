#!/usr/bin/env python3
"""Package an already-built checkout. Usage: python3 .github/package-release.py TAG REPO_NAME"""
import json
from pathlib import Path
import re
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
INCLUDE = ['dist', 'package.json']
REQUIRED = ['dist/negarity-color-visualizer.umd.js', 'dist/negarity-color-visualizer.es.js', 'dist/index.d.ts']
SLUG = 'negarity-color-visualizer'

def main():
    tag, repo = sys.argv[1:]
    # Tags are passed as arguments, never interpolated into shell source or paths.
    for value in (tag, repo):
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._+-]*", value):
            raise SystemExit(f"Unsafe archive name component: {value!r}")
    for name in REQUIRED:
        if not (ROOT / name).is_file():
            raise SystemExit(f"Missing runtime file: {name}; install dependencies/build first")
    output = ROOT / 'release-assets'
    output.mkdir(exist_ok=True)
    archive = output / f'{repo}-{tag}.zip'
    files = {}
    for name in INCLUDE + ['LICENSE', 'LICENSE.txt', 'COPYING', 'languages']:
        source = ROOT / name
        if not source.exists():
            continue
        for path in ([source] if source.is_file() else sorted(source.rglob('*'))):
            if not path.is_file():
                continue
            rel = path.relative_to(ROOT)
            if any(part.startswith('.') or part == '__pycache__' for part in rel.parts):
                continue
            if rel.parts[:2] == ('dist', 'examples'):
                continue
            if path.suffix in ('.map', '.zip', '.log'):
                continue
            # Block editor sources are compiled into build/editor.js.
            if rel.parts[0] == 'includes' and 'blocks' in rel.parts and path.name == 'index.js':
                continue
            # This dependency is a PHP-only package; retain its source and license.
            php_packages = {('vendor', 'jalaljaberi', 'negarity-color'),
                            ('vendor', 'jcupitt', 'vips'), ('vendor', 'psr', 'log')}
            if rel.parts[:3] in php_packages and len(rel.parts) > 3:
                if rel.parts[3] not in ('src', 'LICENSE', 'LICENSE.txt', 'CREDITS', 'composer.json'):
                    continue
            files[rel.as_posix()] = path
    missing = set(REQUIRED) - files.keys()
    if missing:
        raise SystemExit(f'Required files excluded: {sorted(missing)}')
    # Validate local references declared by WordPress block metadata.
    for rel, path in files.items():
        if path.name != 'block.json':
            continue
        metadata = json.loads(path.read_text())
        for value in metadata.values():
            for item in value if isinstance(value, list) else [value]:
                if isinstance(item, str) and item.startswith('file:'):
                    target = (path.parent / item[5:]).resolve().relative_to(ROOT).as_posix()
                    if target not in files:
                        raise SystemExit(f'{rel}: missing runtime reference {target}')
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as package:
        for rel, path in sorted(files.items()):
            package.write(path, f'{SLUG}/{rel}')
    with zipfile.ZipFile(archive) as package:
        if package.testzip() is not None:
            raise SystemExit('Archive integrity check failed')
    print(f'{archive} ({len(files)} runtime files)')

if __name__ == '__main__':
    main()

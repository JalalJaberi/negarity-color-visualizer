# Release ZIP

Publish a GitHub Release (including a prerelease) to build and attach
`<repository>-<tag>.zip`, for example `negarity-color-visualizer-v1.2.3.zip`.
The workflow must be committed before creating the release tag. A tag push alone
does not publish an asset. To rebuild an existing release, use **Actions → Release
runtime ZIP → Run workflow** and enter its tag; this replaces the same named ZIP.

The ZIP has one stable `negarity-color-visualizer/` directory. It contains an explicit runtime
file list, required assets and any license files present. Tests, docs, examples,
agent configuration, Git metadata, source maps and build tools are excluded.
The packager fails if required files or block metadata references are missing.

JavaScript/CSS assets are rebuilt with `npm ci` and `npm run build`.
The ZIP includes built UMD/ES bundles, TypeScript declarations and image assets.
Three.js and Konva are bundled; node_modules and TypeScript sources are excluded.

For a local package after installing dependencies/building assets:

```sh
python3 .github/package-release.py v1.2.3 negarity-color-visualizer
```

Output: `release-assets/`. GitHub Actions needs no extra secret for uploading;
it uses the repository token with `contents: write`.

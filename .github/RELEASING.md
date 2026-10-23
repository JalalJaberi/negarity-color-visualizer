# npm publishing

The package name is `@jalaljaberi/negarity-color-visualizer` and its initial version
is `1.0.0`. `package.json` is the version source; `package-lock.json` must match.
Do not add a separate `VERSION` file. The documentation site's `docs/package.json`
has its own version and does not determine the library's npm version.

## Prepare and verify

Use Node 22 (`nvm use` if you use nvm):

```sh
npm ci
npm run check:version -- v1.0.0
npm run check:package
npm pack
```

`npm run check:package` rebuilds and validates the actual npm file list.
`npm pack` rebuilds production bundles and checks version metadata through `prepack`. Inspect the resulting
`jalaljaberi-negarity-color-visualizer-1.0.0.tgz` before publishing.
It includes ESM and UMD bundles, TypeScript declarations, CSS, images, README and
licenses. Source code, examples, docs, source maps and build tools are excluded.
The UMD global remains `NegarityColorVisualizer` for WordPress and script embeds.

## Publish

Commit and push the prepared changes first. Sign in with an npm account allowed
to publish under the `@jalaljaberi` scope, then publish the inspected tarball:

```sh
npm login --registry=https://registry.npmjs.org/
npm publish ./jalaljaberi-negarity-color-visualizer-1.0.0.tgz --access public
```

npm may ask for account verification or two-factor authentication. Confirm the
published version:

```sh
npm view @jalaljaberi/negarity-color-visualizer@1.0.0 version
```

Publish the matching GitHub Release with tag `v1.0.0` targeting the prepared commit.
The GitHub workflow verifies that the tag equals `v` plus `package.json`'s version,
then builds and attaches the ZIP. It does not publish to npm.

For later versions, use `npm version patch --no-git-tag-version` (or `minor` /
`major`) to update both metadata files, review changes, commit, and use the matching
GitHub tag. A published npm name/version cannot be reused. Use a prerelease version
such as `1.1.0-beta.1` and `npm publish <tarball> --access public --tag next` for betas
so they do not replace the stable `latest` dist-tag.

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

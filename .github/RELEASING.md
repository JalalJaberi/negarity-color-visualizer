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

## Automatic publishing from GitHub

Configure this once on npmjs.com, on the package's **Settings → Trusted Publisher**
section. Choose **GitHub Actions** and enter:

- Organization or user: `JalalJaberi`
- Repository: `negarity-color-visualizer`
- Workflow filename: `release.yml` (no directory prefix)
- Environment name: leave empty (the workflow does not use an environment)
- If allowed-action options are shown, allow direct publishing with `npm publish`.

Save the configuration and complete npm's account verification if prompted.
No npm token or GitHub npm secret is needed. The workflow uses a GitHub-hosted
runner, Node 22, npm 11 and `id-token: write` for OIDC authentication.

Commit and push the workflow before creating the release tag. For each new version:

1. Update the version with `npm version patch --no-git-tag-version` (or `minor` /
   `major`), which updates both package metadata files.
2. Commit and push the changes.
3. Publish a GitHub Release with the matching tag, such as `v1.0.1`.
4. The workflow builds and attaches the ZIP, then publishes the npm package.

The workflow rejects a tag that does not match `package.json`. Stable releases
publish under npm's `latest` tag; prerelease versions or GitHub prereleases use
`next`. Use a prerelease version such as `1.1.0-beta.1` for beta releases.
Manual **Run workflow** runs only rebuild the ZIP and do not publish to npm.

Version `1.0.0` was published manually. Do not try to publish that version again:
npm versions are immutable. Rerunning the npm publishing job for an already
published version will fail; create a new version for new code. Editing an existing
GitHub Release does not trigger publishing; publish a new release.

## Manual fallback

After `npm pack`, you can still publish the generated tarball from your terminal:

```sh
npm login --registry=https://registry.npmjs.org/
npm publish ./jalaljaberi-negarity-color-visualizer-1.0.0.tgz --access public
```

Use the tarball filename for your new version. Manual publishing requires npm's
interactive account verification. Check the published version using
`npm view @jalaljaberi/negarity-color-visualizer version`.

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

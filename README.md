# React Kindle

Build Kindle applications with React and native Kindle controls. React Kindle
provides components, firmware styling, and application window management for
`KPPSimpleLauncher` (KPP).

The device runtime requires React 17.0.2, React Native 0.66.2, and Hermes
bytecode 84. You'll need a development Kindle with SSH access and
`/app/bin/KPPSimpleLauncher`. See [compatibility](docs/guides/compatibility.md) for
firmware profiles and known device limits.

## Run your first app

Use Node.js 16.20.2 and npm 8 or later on macOS arm64/x64 or Linux x64.
Apple Silicon also needs Rosetta for the Hermes compiler. If you use nvm,
run `nvm install` and `nvm use` in this checkout first. Then install dependencies
and create your app:

```sh
npm ci
npm run create-app -- Reader
```

Edit `apps/Reader/App.js`. The generated app imports its controls from
`react-kindle` and handles registration for you.

To build and launch it on your Kindle:

```sh
npm run deploy:app -- apps/Reader --host root@kindle --port 22 --launch
```

Replace `root@kindle` with your device's SSH address. Deployment detects the
firmware, builds the app, and copies it to `/mnt/us/extensions/Reader`.

To build without a connected device, specify the target firmware:

```sh
npm run build:app -- apps/Reader 5.16.2.1.1
```

The payload is written to `build/apps/Reader/5.16.2.1.1/`. Apps created in
`apps/` are ignored by Git; keep your application source in version control
separately.

## Documentation

Read the [documentation site](https://katadelos.github.io/react-kindle/).

- [Getting started](docs/getting-started.md)
- [Build your first app](docs/first-app.md)
- [Standalone project](docs/guides/standalone-project.md): install the package in your own app.
- [Basic example](examples/basic/README.md): a component gallery to copy and adapt.
- [Components](docs/components/index.md): native screenshots and complete examples.
- [Guides](docs/guides/build-and-deploy.md): deployment, layout, lifecycle, and chrome.
- [API](docs/api/application.md): registration, hooks, and capabilities.

### Run the documentation site

The Docusaurus site has its own dependencies and uses Node.js 22. In a separate
terminal, run:

```sh
cd website
nvm install
nvm use
npm ci
npm start
```

If you do not use nvm, select Node.js 22 with your version manager before running
npm. Use `npm run build` to create the static site in `website/build`, and
`npm run serve` to preview that build. Kindle app commands still use Node.js
16.20.2 from the repository root.

The site defaults to `http://localhost:3000/`. For hosting, set `DOCS_URL` to
the site origin and `DOCS_BASE_URL` to its path (with leading and trailing
slashes) when building.

## Use the package in another project

Create a local package:

```sh
npm run pack:library
```

Install the generated `react-kindle-0.1.0.tgz` in your KPP project. The package
includes the components and the `react-kindle` CLI. Follow the
[standalone project guide](docs/guides/standalone-project.md) for dependencies
and Babel setup, or copy the [basic example](examples/basic/README.md).

The library lives in `packages/react-kindle/src`. The CLI lives in
`packages/react-kindle/bin`; the optional chrome plug-in lives in `native`.
The npm package contains component and CLI source. Install Metro, Babel, and
Hermes in your app; native plug-in binaries are built separately.

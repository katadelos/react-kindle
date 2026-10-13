---
slug: /
---
# Getting started

React Kindle lets you build Kindle apps with React and native Kindle controls. Start with the app generator, write your interface, and deploy it over SSH.

## What you need

- A Kindle or emulator with SSH access, `tar`, and `/app/bin/KPPSimpleLauncher`.
- Node.js **16.20.2** and npm **8 or later** for building Kindle apps.
- macOS arm64/x64 or Linux x64. Apple Silicon also needs Rosetta for the Hermes compiler.

The device runtime uses React 17.0.2, React Native 0.66.2, and Hermes bytecode 84. The repository installs matching build dependencies. See [firmware support](guides/compatibility.md) for device coverage.

## Install

From the repository root:

```sh
npm ci
npm run create-app -- Reader
```

If you use nvm, run `nvm install` and `nvm use` first. The root `.nvmrc` selects Node 16.20.2.

The generator creates `apps/Reader/App.js` and `app.json`. It handles app registration and the native root window for you.

**Next: [build your first app](first-app.md).**

## Find what you need

- [Components](components/index.md): screenshots, copyable examples, and props.
- [Build and deploy](guides/build-and-deploy.md): configuration, resources, and managed launch.
- [Layout and state](guides/layout-and-state.md): forms, window size, and page navigation.
- [System chrome](guides/system-chrome.md): title bars and menus.
- [API](api/application.md): registration, hooks, and capability checks.

## Use the package in an existing KPP project

For a complete app to adapt, copy `examples/basic` from the source distribution.
See [standalone projects](guides/standalone-project.md) for installation and CLI usage.

Run `npm run pack:library` in this repository, then install the generated `react-kindle-0.1.0.tgz` in your project. Transform JSX with the React Native 0.66.2 Metro/Babel preset and compile to Hermes bytecode 84. The CLI creates the registration entry. If you provide your own build, call [registerApplication](api/application.md) once in your entry file.

# Use a standalone project

Install the `react-kindle` tarball in your own app. The package includes the
components and a CLI for creating, building, and deploying apps. Builds use
your project's dependencies and configuration.

## Start from the example

The source distribution includes `examples/basic`, a component gallery with
forms, tabs, a slider, and a dialog. Copy the whole directory to your app
location, then run these commands in that copy:

```sh
npm install /absolute/path/to/react-kindle-0.1.0.tgz
npm run build -- 5.19.6
npm run deploy -- --host root@kindle --port 22 --launch
```

Create the tarball with `npm run pack:library` in the library checkout. Use its
actual path when installing, and your target firmware when building. After
installation, the app builds independently of the checkout. Keep the tarball
available for future installs if your lockfile references it.

The Preferences page shows a text field, checkbox, switch, and save dialog.
The Controls page shows a slider, progress bar, radio group, star rating, and
reset button. Copy the component functions from `App.js` into your app.

## Set up an existing project

Use Node.js 16.20.2. Install the library and matching runtime packages:

```sh
npm install /absolute/path/to/react-kindle-0.1.0.tgz react@17.0.2 react-native@0.66.2
npm install --save-dev --save-exact @babel/core@7.29.7 @babel/runtime@7.29.10 metro-react-native-babel-preset@0.66.2 hermes-engine@0.9.0
```

Add `babel.config.js` at the project root:

```js
module.exports = {presets: ['module:metro-react-native-babel-preset']};
```

Create a starter app:

```sh
npx --no-install react-kindle create Reader
npx --no-install react-kindle build apps/Reader 5.19.6
```

The generator writes `apps/Reader/App.js` and `app.json`. The build creates the
registration entry and compiles it to Hermes bytecode 84. You do not call
`registerApplication` in `App.js` when using this CLI.

## CLI commands

Run commands from your project root, where `package.json` and Babel configuration
live. The app directory can be the project root (`.`) or a directory inside it.

| Command | Purpose |
|---|---|
| `react-kindle create NAME` | Create an app in `apps/NAME`. |
| `react-kindle build APP_DIRECTORY FIRMWARE` | Build a payload in `build/apps/NAME/FIRMWARE`. |
| `react-kindle deploy APP_DIRECTORY --host HOST --port PORT --launch` | Detect firmware, build, copy, and launch over SSH. |

Use these commands in npm scripts or prefix them with `npx --no-install`.
Deployment also accepts `--identity PATH` and `--ssh-config PATH`. Omit
`--launch` to copy without starting the app. Stop an existing instance before
deploying again.

Native plug-in paths in `app.json` are relative to the project root. See
[build and deployment](build-and-deploy.md#app-configuration) for configuration
fields and [system chrome](system-chrome.md) for the optional native plug-in.

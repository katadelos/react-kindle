# Component gallery

A small Kindle app to copy and adapt. It imports `react-kindle` as an installed
package and builds from this directory.

- **Preferences:** a text field, checkbox, switch, and confirmation dialog.
- **Controls:** a slider, progress bar, radio group, star rating, and reset button.
- **Navigation:** tabs select pages in a notebook; values remain in React state
  when you switch pages.

The example stores values for the current session. It does not change device
settings or write preferences to disk. Start editing in `App.js`.

## Install

Use Node.js 16.20.2 and npm 8 or later. On Apple Silicon, install Rosetta for
the Hermes compiler.

From a React Kindle source checkout, run `npm run pack:library` to create
`react-kindle-0.1.0.tgz`. Copy this entire example directory to your own project
location. In that copy, install the tarball:

```sh
npm install /absolute/path/to/react-kindle-0.1.0.tgz
```

Use the actual tarball path. This installs the example's dependencies and the
library; no source checkout is needed after installation. Keep the resulting
`package-lock.json` in your app repository. If reinstalling from the lockfile,
keep the tarball at the path recorded there.

## Build

```sh
npm run build -- 5.19.6
```

Replace `5.19.6` with your target firmware. The payload is written to
`build/apps/ComponentGallery/5.19.6/`, including Hermes bytecode 84 and launcher
configuration. The `react-kindle` CLI comes from the installed package; Metro,
Babel, and Hermes come from this app's dependencies.

## Deploy

The Kindle needs SSH, `tar`, and `/app/bin/KPPSimpleLauncher`:

```sh
npm run deploy -- --host root@kindle --port 22 --launch
```

Deployment detects the firmware and builds for that version. Add
`--identity /path/to/key` or `--ssh-config /path/to/config` when needed.
Stop the app before redeploying.

The app identity is in `app.json`. To rename it, change `name` and set `id` to
`com.lab126.` followed by that name. Names must begin with a letter and contain
only letters and digits. The generated entry handles registration; `App.js`
only exports the root component.

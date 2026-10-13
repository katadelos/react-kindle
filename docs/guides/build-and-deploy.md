# Build and deploy an app

These commands use the library checkout. For your own project, see
[standalone projects](standalone-project.md). Both use the same packaged CLI.

Run these commands from the repository root with Node.js 16.20.2 and npm 8 or
later on macOS arm64/x64 or Linux x64. Apple Silicon requires Rosetta for Hermes.
Deployment also uses the host’s `ssh` and `tar` commands.

## Create and build

If you use nvm, run `nvm install` and `nvm use` first; `.nvmrc` selects the
required Node.js version.

```sh
npm ci
npm run create-app -- Reader
npm run build:app -- apps/Reader 5.16.2.1.1
```

`npm ci` installs the workspace dependencies, including the Hermes compiler.
The app name must begin with a letter and contain only letters and digits.

Edit `apps/Reader/App.js`, put resources in `res/`, and translations in
`locale/`. Export your root component as the default export. The build creates
the registration entry, so you don't call `registerApplication` in `App.js`.
You can also export `onRequestClose` and `onWindowLayout` callbacks.

The `apps/` directory is ignored by Git. Keep your app source in a separate
repository if you want to version it.

### App configuration

`app.json` contains:

| Field | Value |
|---|---|
| `name` | App name, such as `Reader` |
| `id` | `com.lab126.` followed by the app name |
| `chrome` | System chrome mode, 0–4; defaults to 1 (none) |
| `presentation` | Optional `classic` or `unified` styling profile; otherwise selected from the firmware |
| `nativePlugins` | Optional array of paths to built `.so` files, relative to the repository root |

See [system chrome](system-chrome.md) for modes and the chrome plug-in, and
[compatibility](compatibility.md) for profile selection.

### Build output

The payload is written to `build/apps/Reader/FIRMWARE/`:

- `js/app.hbc`: compiled application bytecode.
- `res/` and `locale/`: resources and translations.
- `config.dev` and `config.appmgrd`: direct and managed launcher configurations.
- `application.install`: application-manager registration.
- `target.json`: app identity and firmware metadata.
- `lib/`: native plug-ins, when configured.

## Deploy and launch

```sh
npm run deploy:app -- apps/Reader --host root@kindle --port 22 --launch
```

The Kindle needs SSH, tar, and `/app/bin/KPPSimpleLauncher`. Deployment reads
the device firmware, builds for that release, and copies the payload to
`/mnt/us/extensions/Reader`. The `--launch` flag starts the app directly with
`config.dev`; omit it to copy files without launching. Add `--identity PATH`
to select an SSH private key, or `--ssh-config PATH` to use an SSH configuration file.

Stop or unload the app before redeploying. Deployment refuses to replace a
running instance. Native plug-ins are checked against the launcher's float and C++ string
ABIs and installed under `/var/local/Reader/lib`.

## Managed launch

Use managed launch when the app should participate in the Kindle application
manager's pause and resume lifecycle.

On the device, back up `/var/local/appreg.db`, then use `/usr/bin/register` to
register the generated `application.install` against that database. Launch
`com.lab126.Reader` through the application manager. The registration selects
`config.appmgrd` and unloads the app when paused.

Do not run direct and managed instances with the same app identity at the same
time. See [lifecycle](lifecycle.md) for pause handling and shutdown callbacks.

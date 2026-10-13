# Application lifecycle

The app generator handles registration for you. When integrating the package
with your own build, call `registerApplication` once in the entry file:

```js
import {Chrome, registerApplication} from 'react-kindle';
import App, {requestApplicationExit} from './App';

registerApplication({
  id: 'com.lab126.Reader',
  firmware: '5.16.2.1.1',
  component: App,
  chrome: Chrome.navigation,
  onRequestClose: requestApplicationExit,
});
```

The function registers `ReactNativeFrontEnd`, wraps the app in `KindleProvider`,
and creates the native root window. The app ID must match the launcher's
`--name Reader` argument.

## Shutdown

`onRequestClose` runs when the window receives `INITIATE_SHUTDOWN`. Implement
this callback using your app's native or service integration to exit the
process. The package does not provide a JavaScript quit function.

With the generated build, export `onRequestClose` from `App.js` to provide
this callback. If you omit it, shutdown messages have no application callback.
The launcher still handles managed pause and unload.

Save important state before requesting exit. The managed registration uses
`unloadOnPause`, and process termination can skip component cleanup.

## Direct and managed launch

Direct launch uses `config.dev` and starts with a visible window. Managed
launch uses `config.appmgrd`, requires application-manager registration, and
starts hidden until the manager sends GO. The package detects managed mode
through `NativeModules.LaunchControl`.

| Event | Package behavior |
|---|---|
| Bundle evaluation | Register the root and install GO/PAUSE listeners |
| Root mount | Call `reportLoadResult(0)` after installing the window controller |
| GO | Show the window, then call `reportGoResult(0)` after the state update |
| PAUSE | Hide the window, then call `reportPauseResult(0)` after the state update |
| RUN / UNLOAD | Handled by the launcher |

Signals received before root mount are held until the window controller is
ready. LOAD is acknowledged after mount so the native bridge can deliver GO.

See [managed launch](build-and-deploy.md#managed-launch) for registration.
Do not run direct and managed instances with the same identity at the same time.

## Window and chrome

The root uses a full-screen native window in the app's window group, enables
keyboard handling, and uses the app ID as its window title. Pass `onLayout` to
`registerApplication` to receive root layout events. In a generated app,
export this callback as `onWindowLayout`.

System chrome defaults to `Chrome.none`. Use `useChrome()` to change it at
runtime. The root follows native window layout events and makes the available
width and height accessible through `useKindle().window`. See
[system chrome](system-chrome.md) for title and menu configuration.

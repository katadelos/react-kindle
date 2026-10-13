# Application registration

Use `registerApplication` when you supply your own entry file. The app generator calls it for you; generated `App.js` files only export the root component.

```jsx
import React from 'react';
import {Chrome, Text, View, registerApplication} from 'react-kindle';

function App() {
  return <View style={{flex: 1, padding: 24}}><Text>Reader</Text></View>;
}

registerApplication({
  id: 'com.lab126.Reader',
  firmware: '5.19.6',
  component: App,
  chrome: Chrome.none,
});
```

Set `firmware` to the device release. The ID must match the launcher's `--name Reader` argument.

## Options

| Option | Description |
|---|---|
| `id` | Required `com.lab126.NAME`; NAME begins with a letter and contains only letters and digits. |
| `component` | Required React root component. |
| `firmware` | Required dotted numeric firmware release. |
| `chrome` | Initial mode; defaults to `Chrome.none`. |
| `presentation` | Optional `classic` or `unified` styling override. |
| `fontScale` | Optional positive scale override. |
| `onRequestClose` | Called on native shutdown requests. Your app supplies the exit integration. |
| `onLayout` | Receives root window layout events. |

Registration installs KindleProvider, the native root window, style defaults, and managed lifecycle listeners. It returns a function that removes those listeners; that function does not terminate the process.

In generated apps, export `onRequestClose` and `onWindowLayout` from `App.js` to supply the callbacks. See [application lifecycle](../guides/lifecycle.md) for managed launch and shutdown.

## Chrome modes

| Constant | Value | Use |
|---|---|---|
| `Chrome.automatic` | 0 | Let the system select chrome. |
| `Chrome.none` | 1 | No system chrome. |
| `Chrome.status` | 2 | Status bar. |
| `Chrome.navigation` | 3 | Status and navigation bars. |
| `Chrome.full` | 4 | Full system chrome mode. |

Set the numeric mode in `app.json`, or use the constants in JavaScript. See [system chrome](../guides/system-chrome.md) for title and menu configuration.

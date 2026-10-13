# Hooks

Call these hooks inside components under KindleProvider. Generated apps install the provider automatically.

## useKindle

Read the current window dimensions and firmware styling:

```jsx
import React from 'react';
import {Text, View, useKindle} from 'react-kindle';

export default function App() {
  const {window, scale} = useKindle();
  return (
    <View style={{flex: 1, padding: scale(24)}}>
      <Text>Window: {window.width} × {window.height}</Text>
    </View>
  );
}
```

| Member | Description |
|---|---|
| `window` | Available window metrics, updated from native layout events. |
| `fontScale` | Current positive font scale. |
| `scale(number)` | Multiply a base value by fontScale. |
| `firmware` | Configured firmware release. |
| `applicationId` | Application identity. |
| `stock` | Selected firmware styling profile. |
| `supports(feature)` | Whether the current process exposes a native capability. |
| `require(feature)` | Throw if a capability is missing. |
| `chrome` | Chrome controller supplied by registration. |

## useChrome

Change the system chrome mode at runtime:

```jsx
import React from 'react';
import {Button, Chrome, View, useChrome} from 'react-kindle';

export default function App() {
  const {mode, setMode} = useChrome();
  return (
    <View style={{flex: 1, padding: 24}}>
      <Button onPress={() => setMode(
        mode === Chrome.none ? Chrome.navigation : Chrome.none
      )}>Toggle navigation bar</Button>
    </View>
  );
}
```

This hook requires `registerApplication`, which supplies `{mode, setMode}`.

## useChromeConfiguration

Configure title and menu content through the native chrome plug-in. See the complete [title and menu example](../guides/system-chrome.md#titles-and-menus) and build instructions.

| Option | Default | Description |
|---|---|---|
| `title` | — | Title text. |
| `template` | `title` | Native title or search layout. |
| `buttons` | `[]` | Items with id, label, uri, alignment, disabled, and onPress. |
| `menu` | `[]` | Items with id, label, group, disabled, and onPress. |
| `hideBottomChrome` | `true` | Hide the bottom chrome area. |

The hook returns `{available}`. Button alignment defaults to `right`; menu group defaults to `0`. Use the `KPP_MORE` button to open the system menu. Call the hook once in your root component.

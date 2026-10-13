# react-kindle

Build Kindle KPP applications with React components and native Kindle controls.
The package handles firmware styling, application windows, and managed lifecycle
events.

Requires React **17.0.2**, React Native **0.66.2**, and `KPPSimpleLauncher`.
Transform the package's JSX with the React Native 0.66.2 Metro/Babel preset and
compile the app to Hermes bytecode 84.

## Register an app

```jsx
import React, {useState} from 'react';
import {Button, Text, View, registerApplication} from 'react-kindle';

function App() {
  const [saved, setSaved] = useState(false);
  return (
    <View style={{flex: 1, padding: 24}}>
      <Text>{saved ? 'Saved' : 'Ready'}</Text>
      <Button onPress={() => setSaved(true)}>Save</Button>
    </View>
  );
}

registerApplication({
  id: 'com.lab126.Reader',
  firmware: '5.16.2.1.1',
  component: App,
});
```

Call `registerApplication` once in your entry file. It installs the
`ReactNativeFrontEnd` root, `KindleProvider`, native window, and lifecycle
listeners. The ID must match the launcher's `--name Reader` argument. Set
`firmware` to the device's actual release.

## Build in your own project

Use Node.js 16.20.2 and install the build dependencies in your app:

```sh
npm install react@17.0.2 react-native@0.66.2
npm install --save-dev --save-exact @babel/core@7.29.7 @babel/runtime@7.29.10 metro-react-native-babel-preset@0.66.2 hermes-engine@0.9.0
```

Install this package from its tarball, then add `babel.config.js`:

```js
module.exports = {presets: ['module:metro-react-native-babel-preset']};
```

The package includes the `react-kindle` CLI:

```sh
npx --no-install react-kindle create Reader
npx --no-install react-kindle build apps/Reader 5.19.6
npx --no-install react-kindle deploy apps/Reader --host root@kindle --port 22 --launch
```

Run commands from your app project root. Edit `apps/Reader/App.js` to build
its interface. Use your target firmware in the build command; deployment
detects it automatically. Stop the app before redeploying.

The CLI generates the registration entry, so `App.js` only exports a root
component. Its build output is `build/apps/Reader/FIRMWARE/`. An app can also
live directly in the project root: use `react-kindle build . FIRMWARE` with
an `App.js` and `app.json` in that directory.

The source distribution includes a complete example in `examples/basic` with
its own dependencies, Babel configuration, and npm scripts. Copy it to start
with tabs, a form, a dialog, and native controls.

## Components

- Layout: `View`, `Text`, `Page`, `Notebook`, `ScrollView`.
- Controls: `Button`, `Checkbox`, `Switch`, `SettingsToggle`, `SettingsRow`,
  `TextInput`, `TextField`, `Slider`, `RadioButton`, `RadioGroup`, `ListItem`, `TabBar`.
- Feedback: `ProgressBar`, `ScrollBar`, `ActivityIndicator`, `Divider`, `SheetHandle`.
- Content: `Image`, `MarkupText`, `QRCode`, `StaticDocument`, `TextMeasurement`,
  `StarRating`, `AnimatedText`.
- Surfaces: `Dialog`, `BottomSheet`, `Overlay`.
- Integration: `KindleProvider`, `useKindle`, `useChrome`, `useChromeConfiguration`,
  `Chrome`, `registerApplication`, `inspectCompatibility`, `inspectFeature`,
  `getFirmwareProfile`.

The source checkout includes component examples and screenshots in
`docs/components/`. Run the Docusaurus site from `website/` to browse them.

## Device compatibility

The package provides styling profiles for 5.16.2.1.1 and 5.18.1.1.1. Emulator
coverage spans 5.16.2.1.1, 5.18.1.1.1, 5.19.6, and 5.20.1; physical-device
coverage is limited to selected features on KT3 5.16.2.1.1. Components check
the native capabilities they need and throw when one is missing. Use `useKindle().supports(feature)` to check
optional actions before exposing them in your UI.

These components require Kindle native managers and cannot run in ordinary
Android, iOS, or browser applications. The 5.16 standalone launcher has no
controlled-scroll `scrollTo` command or usable `StaticDocument` source property.
Multiline focus and blur commands are unavailable on the tested launchers.

# System chrome

System chrome provides the Kindle title bar, search, and other system windows
around your app. Set the initial mode with `chrome` in `app.json` or
`registerApplication`:

| Constant | Value |
|---|---|
| `Chrome.automatic` | 0 |
| `Chrome.none` (default) | 1 |
| `Chrome.status` | 2 |
| `Chrome.navigation` | 3 |
| `Chrome.full` | 4 |

Import `Chrome` and `useChrome` from `react-kindle`. The hook returns
`{mode, setMode}` for changing the mode at runtime. Mode 2 shows the status bar; mode 3 also shows the navigation bar. The
`template` passed to `useChromeConfiguration` selects its title or search layout.

## Titles and menus

The optional native chrome plug-in adds title and menu configuration, action
callbacks, and window geometry. With the plug-in installed, call
`useChromeConfiguration` once in your root component:

```jsx
import React, {useState} from 'react';
import {Dialog, Text, View, useChromeConfiguration} from 'react-kindle';

export default function App() {
  const [aboutVisible, setAboutVisible] = useState(false);
  useChromeConfiguration({
    title: 'Reader',
    buttons: [{id: 'KPP_MORE'}],
    menu: [{id: 'about', label: 'About', onPress: () => setAboutVisible(true)}],
  });

  return (
    <View style={{flex: 1}}>
      <Text>Reader</Text>
      <Dialog visible={aboutVisible} title="About Reader" cancelLabel=""
        onConfirm={() => setAboutVisible(false)}
        onDismiss={() => setAboutVisible(false)}>
        A Kindle reading app.
      </Dialog>
    </View>
  );
}
```

Set `chrome` to 3 in `app.json` to show the title and menu. Use
[managed launch](build-and-deploy.md#managed-launch) so the system associates
chrome with the correct application. The hook returns `{available}` to report
whether the plug-in is present.

## Build the plug-in

The build requires Make and an ARM Linux GCC cross-toolchain with C++14 support
and a sysroot compatible with the target Kindle. Choose the launcher's float ABI
and C++ string ABI:

| Device and firmware | Make variables |
|---|---|
| PW3, 5.16.2.1.1 | `FLOAT_ABI=softfp STRING_ABI=0` |
| PW4, 5.18.1.1.1 | `FLOAT_ABI=hard STRING_ABI=0` |
| Basic 2024, 5.19.6 | `FLOAT_ABI=hard STRING_ABI=1` |
| Scribe 3, 5.20.1 | `FLOAT_ABI=hard STRING_ABI=1` |

Set `CROSS_COMPILE` to your compiler prefix, including its path and trailing
hyphen. For example, if your hard-float compiler is
`/opt/arm-toolchain/bin/arm-linux-gnueabihf-g++`, build for PW4 with:

```sh
make -C native CROSS_COMPILE=/opt/arm-toolchain/bin/arm-linux-gnueabihf- \
  FLOAT_ABI=hard STRING_ABI=0
```

The output is `native/build/hard/abi0/libReactKindleChrome.so`. Add that path
to `app.json`:

```json
{"nativePlugins": ["native/build/hard/abi0/libReactKindleChrome.so"]}
```

The Makefile defaults to `FLOAT_ABI=softfp STRING_ABI=0`. Use a toolchain and
sysroot built for the selected float ABI. `STRING_ABI` selects the C++ string ABI;
it does not change the toolchain's target libraries. The compiler must run on
your build host; a Linux toolchain can be used inside a Linux container or VM.

Build outputs are separated by ABI under `native/build/`. Run
`make -C native clean` to remove them. Standard `CPPFLAGS`, `CXXFLAGS`, and
`LDFLAGS` variables accept additional compiler and linker options.

The app builder includes the library in the payload. Deployment checks both
ABIs and installs the library under `/var/local/NAME/lib`, because `/mnt/us`
can be mounted `noexec`. The npm package does not include the native plug-in.

## Window geometry and availability

The application root follows native window layout events and exposes the
available width and height through `useKindle().window`. This works without
the chrome plug-in.

Use `useKindle().supports('chromeTransport')` to check title/menu support.
The `windowGeometry` capability reports the plug-in's viewport query support;
it is independent of the root's layout events.
The transport uses `<applicationId>.chrome` for LIPC notifications and delivers
actions to React callbacks.

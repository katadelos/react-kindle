# Firmware compatibility

React Kindle requires the Kindle KPP runtime with React 17.0.2, React Native
0.66.2, and Hermes bytecode 84. Ordinary React Native runtimes do not provide
the Kindle native managers used by its components.

## Firmware profiles

| Profile | Reference firmware |
|---|---|
| `classic` | 5.16.2.1.1 |
| `unified` | 5.18.1.1.1 |

The build accepts dotted numeric firmware releases. It selects `classic` below
5.18 and `unified` from 5.18 onward. This selects styling; it does not establish
that a device supports every component. Set `presentation` in `app.json` or
`registerApplication` to choose a profile explicitly.

## Native capabilities

Components check the running process for required native managers, properties,
events, commands, and modules. Missing requirements produce an error. A
firmware version alone cannot determine which services a launcher exposes.

For optional actions, check availability before showing the action:

```jsx
const {supports} = useKindle();
const canFocus = supports('textInput.focus');
```

For a detailed report, use:

```js
import {inspectCompatibility, inspectFeature} from 'react-kindle';

const report = inspectCompatibility('5.16.2.1.1');
const focus = inspectFeature('5.16.2.1.1', 'textInput.focus');
```

On 5.16.2.1.1, the standalone launcher has no controlled-scroll `scrollTo`
command or usable `StaticDocument` source property. Multiline inputs do not
expose native `focus` or `blur` commands on the tested releases. Stock
application services can also be absent from a standalone app.

## Runtime coverage

The emulator coverage includes controls, managed launch, pause/unload, and
chrome menus on these firmware images:

| Firmware | Emulated device |
|---|---|
| 5.16.2.1.1 | Paperwhite 3 |
| 5.18.1.1.1 | Paperwhite 4 |
| 5.19.6 | Basic 2024 |
| 5.20.1 | Scribe 3 |

Physical-device coverage is limited to selected controls, editing, managed
lifecycle, and chrome on KT3 5.16.2.1.1. Emulator coverage does not establish
display refresh quality or touch behavior on hardware; check those on your
target device.

## Bytecode and native plug-ins

The supplied Hermes compiler emits bytecode 84. A runtime using another
bytecode version needs a matching compiler. Native plug-ins must separately
match the launcher's float and C++ ABIs. A firmware styling profile does not
select either ABI.

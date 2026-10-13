# Compatibility API

These functions inspect the current Kindle process. The firmware argument selects a styling profile; it does not simulate another device.

```js
import {inspectCompatibility, inspectFeature, getFirmwareProfile} from 'react-kindle';

const focus = inspectFeature('5.19.6', 'textInput.focus');
console.log(focus.available, focus.reason);

const report = inspectCompatibility('5.19.6');
console.log(report.features.slider);

const profile = getFirmwareProfile('5.19.6');
console.log(profile.presentation);
```

Use the running device's firmware release in these calls.

## inspectFeature(firmware, feature)

Returns `{available, reason}`. `reason` is null when the capability is available; otherwise it describes the missing native contract. Unknown feature names throw.

Common feature names include `button`, `checkbox`, `switch`, `slider`, `trackSlider`, `textInput`, `multilineTextInput`, `staticDocument`, `paginatedScroll`, `controlledScroll`, and `chromeTransport`.

Commands have separate names: `textInput.focus`, `textInput.blur`, `multilineTextInput.focus`, `multilineTextInput.blur`, and `controlledScroll.scrollTo`.

## inspectCompatibility(firmware, presentation?)

Returns the firmware, selected presentation, reference firmware, recovery metadata, and a `features` map of capability results. Use `features` to inspect the native managers, props, events, commands, and modules exposed by your launcher.

## getFirmwareProfile(firmware, presentation?)

Returns the selected styling profile, including typography and control styles. Firmware below 5.18 selects `classic`; firmware from 5.18 selects `unified`. Pass a presentation explicitly to override that choice.

See [firmware compatibility](../guides/compatibility.md) for supported runtime versions and known limits.

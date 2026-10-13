# SettingsToggle

Turn an option on or off with a rectangular, labeled control. Use Switch for a rounded toggle.

![SettingsToggle in a native Kindle example](../images/settings.png)

## Usage

Save this example as `apps/Reader/App.js` in the [starter app](../first-app.md).

```jsx
import React, {useState} from 'react';
import {SettingsToggle, View} from 'react-kindle';

export default function App() {
  const [enabled, setEnabled] = useState(true);

  return (
    <View style={{padding: 24}}>
      <SettingsToggle value={enabled} onValueChange={setEnabled} />
    </View>
  );
}
```

## Props

| Prop | Type / default | Description |
|---|---|---|
| value | boolean = false | Current selection. |
| onValueChange | (value: boolean) => void | Selection callback. |
| onLabel / offLabel | string = On / Off | Labels; supply translated text here. |
| disabled | boolean = false | Prevents changes. |
| style | View style | Layout overrides. |

This control only changes React state. Your app must apply any device setting.

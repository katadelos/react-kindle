# KindleProvider

Provide firmware styling, window metrics, and capability checks to a component tree. The generated app entry installs this provider automatically.

## Usage

This example wraps content inside an existing KPP application. Generated apps already have a provider.

```jsx
import React from 'react';
import {KindleProvider, Text, View} from 'react-kindle';

export default function App() {
  return (
    <KindleProvider firmware="5.19.6" applicationId="com.lab126.Reader" fontScale={1}>
      <View style={{padding: 24}}><Text>Reader</Text></View>
    </KindleProvider>
  );
}
```

## Props

| Prop | Type / default | Description |
|---|---|---|
| firmware | string | Target firmware release. |
| applicationId | string | Launcher application identity. |
| presentation | classic / unified | Override the firmware styling profile. |
| fontScale | positive number | Override the runtime window font scale. |
| windowMetrics | object | Override runtime window metrics. |
| chrome | object | Chrome controller supplied by registration. |
| children | React nodes | Component subtree. |

Use a manual provider only when embedding components in an existing KPP application. It does not register an app or create a native window. For standalone apps, use the generated entry or [registerApplication](../api/application.md). This provider has no visible surface.

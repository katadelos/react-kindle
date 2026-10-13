# ProgressBar

Show completion as a percentage. Use ActivityIndicator when the total is unknown.

![ProgressBar in a native Kindle example](../images/progress-activity.png)

## Usage

Save this example as `apps/Reader/App.js` in the [starter app](../first-app.md).

```jsx
import React from 'react';
import {ProgressBar, Text, View} from 'react-kindle';

export default function App() {
  return (
    <View style={{padding: 24}}>
      <Text>65% complete</Text>
      <ProgressBar value={65} style={{width: '100%'}} />
    </View>
  );
}
```

## Props

| Prop | Type / default | Description |
|---|---|---|
| value | number = 0 | Finite percentage, clamped to 0–100. |
| style | View style | Defaults to 278 × 28 with a one-unit border. |

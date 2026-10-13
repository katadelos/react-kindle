# TextMeasurement

Wrap a text subtree when you need Kindle native text measurement in its layout.

![TextMeasurement in a native Kindle example](../images/rating-animated-text.png)

## Usage

Save this example as `apps/Reader/App.js` in the [starter app](../first-app.md).

```jsx
import React from 'react';
import {Text, TextMeasurement, View} from 'react-kindle';

export default function App() {
  return (
    <View style={{padding: 24}}>
      <TextMeasurement style={{width: 300}}>
        <Text>A paragraph measured by the native text wrapper.</Text>
      </TextMeasurement>
    </View>
  );
}
```

## Props

| Prop | Type / default | Description |
|---|---|---|
| children | React nodes | Text subtree to measure. |
| style | View style | Wrapper dimensions and layout. |

This is a structural wrapper; it does not draw a control or return a measurement result. The screenshot shows its text below the rating and animation.

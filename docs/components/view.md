# View

Arrange content with React Native flex layout. View adds the native Kindle wrapper around that layout.

![View in a native Kindle example](../images/tabs-notebook.png)

## Usage

Save this example as `apps/Reader/App.js` in the [starter app](../first-app.md).

```jsx
import React from 'react';
import {Text, View} from 'react-kindle';

export default function App() {
  return (
    <View style={{flex: 1, padding: 24}}>
      <Text variant="title">Your books</Text>
      <View style={{flexDirection: 'row', marginTop: 16}}>
        <Text style={{flex: 1}}>Reading</Text><Text>12 books</Text>
      </View>
    </View>
  );
}
```

## Props

| Prop | Type / default | Description |
|---|---|---|
| children | React nodes | Content to arrange. |
| style | View style | Flex, padding, dimensions, and positioning. |
| name | string | Native wrapper name. |
| disabled | boolean | Native wrapper disabled state. |
| accessibilityASRDefaultFocus | boolean | Native default focus hint. |
| onLayout | function | Inner layout measurements. |

View has no visible decoration by default. The screenshot shows a layout containing tabs and page content. Styles and layout events apply to the inner React Native view.

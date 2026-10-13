# Divider

Separate adjacent sections with a line.

![Divider in a native Kindle example](../images/divider-handle.png)

## Usage

Save this example as `apps/Reader/App.js` in the [starter app](../first-app.md).

```jsx
import React from 'react';
import {Divider, Text, View} from 'react-kindle';

export default function App() {
  return (
    <View style={{padding: 24}}>
      <Text>Library</Text>
      <Divider style={{marginVertical: 16}} />
      <Text>Settings</Text>
    </View>
  );
}
```

## Props

| Prop | Type / default | Description |
|---|---|---|
| vertical | boolean = false | Draw vertically. |
| thickness | positive number = 1 | Line thickness. |
| length | number or percentage = 100% | Line length. |
| color | string = #AAAAAA | Line color. |
| pattern | string = none | Native drawing pattern. |
| style | View style | Placement. |

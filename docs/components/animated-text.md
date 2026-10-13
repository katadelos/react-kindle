# AnimatedText

Add a changing suffix to a status label without changing the space it occupies.

![AnimatedText in a native Kindle example](../images/rating-animated-text.png)

## Usage

Save this example as `apps/Reader/App.js` in the [starter app](../first-app.md).

```jsx
import React from 'react';
import {AnimatedText, View} from 'react-kindle';

export default function App() {
  return (
    <View style={{padding: 24}}>
      <AnimatedText interval={600}>Loading</AnimatedText>
    </View>
  );
}
```

## Props

| Prop | Type / default | Description |
|---|---|---|
| children | text | Status label. |
| pattern | string = ... | Characters revealed one at a time. |
| interval | positive number = 300 | Milliseconds between frames. |
| animating | boolean = true | False shows the complete suffix. |
| style | Text style | Text and background colors. |

Set `style.backgroundColor` when using a non-white surface; hidden suffix characters use that color. The screenshot shows one animation frame.

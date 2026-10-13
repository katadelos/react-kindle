# MarkupText

Render Pango markup for inline formatting. Use Text for ordinary labels and paragraphs.

![MarkupText in a native Kindle example](../images/markup-html.png)

## Usage

Save this example as `apps/Reader/App.js` in the [starter app](../first-app.md).

```jsx
import React from 'react';
import {MarkupText, View} from 'react-kindle';

export default function App() {
  return (
    <View style={{padding: 24}}>
      <MarkupText markup={'<span font_desc="Amazon Ember 18px">Read <b>bold</b> and <i>italic</i> text.</span>'}
        style={{width: '100%', height: 80}} />
    </View>
  );
}
```

## Props

| Prop | Type / default | Description |
|---|---|---|
| markup | string | Explicit Pango markup; do not combine with children. |
| children | string | Plain text, escaped before rendering. |
| size | positive number = 18 | Font size for plain children. |
| style | View style | Supply enough height for the content. |

Pass unformatted user text as children. Explicit `markup` is sent to the native parser as supplied.

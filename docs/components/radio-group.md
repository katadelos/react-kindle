# RadioGroup

Choose one value from a list of labeled options.

![RadioGroup in a native Kindle example](../images/radio-list.png)

## Usage

Save this example as `apps/Reader/App.js` in the [starter app](../first-app.md).

```jsx
import React, {useState} from 'react';
import {RadioGroup, View} from 'react-kindle';

export default function App() {
  const [sort, setSort] = useState('recent');

  return (
    <View style={{padding: 24}}>
      <RadioGroup value={sort} onValueChange={setSort} options={[
        {value: 'recent', label: 'Recent'},
        {value: 'title', label: 'Title'},
        {value: 'author', label: 'Author', disabled: true},
      ]} />
    </View>
  );
}
```

## Props

| Prop | Type / default | Description |
|---|---|---|
| options | array | Entries have value, label, and optional disabled. |
| value | option value | Currently selected option. |
| onValueChange | (value) => void | Receives the chosen option value. |
| disabled | boolean = false | Disables the entire group. |

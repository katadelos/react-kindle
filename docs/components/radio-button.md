# RadioButton

Select one option. Use RadioGroup when you have a labeled list of choices.

![RadioButton in a native Kindle example](../images/radio-list.png)

## Usage

Save this example as `apps/Reader/App.js` in the [starter app](../first-app.md).

```jsx
import React, {useState} from 'react';
import {RadioButton, Text, View} from 'react-kindle';

export default function App() {
  const [sort, setSort] = useState('Recent');

  return (
    <View style={{padding: 24}}>
      {['Recent', 'Title'].map(option => (
        <View key={option} style={{flexDirection: 'row', alignItems: 'center'}}>
          <RadioButton value={sort === option} onValueChange={() => setSort(option)}
            accessibilityLabel={option} />
          <Text>{option}</Text>
        </View>
      ))}
    </View>
  );
}
```

## Props

| Prop | Type / default | Description |
|---|---|---|
| value | boolean = false | Whether this option is selected. |
| onValueChange | (value: true) => void | Runs when an unselected option is pressed. |
| disabled | boolean = false | Prevents selection. |
| style | View style | Defaults to 44 × 44. |
| accessibilityLabel | string | Spoken option label. |

# Layout and state

Import components from `react-kindle` inside your app's root component.
The generated entry installs `KindleProvider` and registers the app.

## Forms

Keep form values in React state. Controls report changes through
`onValueChange` or `onChangeText`:

```jsx
import React, {useState} from 'react';
import {Button, Checkbox, Text, TextInput, View} from 'react-kindle';

export default function Preferences({onSave}) {
  const [title, setTitle] = useState('Reading');
  const [enabled, setEnabled] = useState(false);

  return (
    <View style={{flex: 1, padding: 24}}>
      <Text style={{marginBottom: 16}}>Collection name</Text>
      <TextInput value={title} onChangeText={setTitle} maxLength={80} />
      <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 16}}>
        <Checkbox
          value={enabled}
          onValueChange={setEnabled}
          accessibilityLabel="Include archived books"
          style={{width: 44, height: 44, marginRight: 12}}
        />
        <Text>Include archived books</Text>
      </View>
      <Button disabled={!title.trim()} onPress={() => onSave(title, enabled)}>
        Save
      </Button>
    </View>
  );
}
```

Render this form from your app with an `onSave` callback. The callback handles
persistence; the form owns its editable state. For a field with a label, hint,
and validation message, use `TextField`.

## Layout and text

Use flex layout and the current window size instead of fixed screen dimensions.
`useKindle()` provides `window`, `fontScale`, and a `scale(value)` helper.
The font scale comes from the runtime window unless you supply it explicitly
to `KindleProvider` or `registerApplication`.

`Text` defaults to Amazon Ember. Set `variant` for a heading or caption; see
[typography](../components/text.md) for the available presets.
Use `MarkupText` when you need Pango markup.

Button height and label size follow the font scale. Padding, minimum width,
border radius, and border width keep their base values. Use button `style`
for surrounding layout and margins; the component controls its own visual
geometry.

## Pages

Use `Notebook` to select a page by name:

```jsx
<Notebook page={page}>
  <Page name="general"><GeneralSettings /></Page>
  <Page name="advanced"><AdvancedSettings /></Page>
</Notebook>
```

Import `Notebook` and `Page` from `react-kindle`. Keep `page` in React state
and change it with your own navigation, such as `TabBar`. Each page needs a
unique name. Pages stay mounted when hidden, so pause background work when
the selected page changes. A page's `style` applies to its inner layout view.

## Optional device actions

Some launchers expose controls without every associated command. Check the
specific action before offering it:

```jsx
const {supports} = useKindle();
const canFocus = supports('textInput.focus');
```

Components check their own required native capabilities. See
[compatibility](compatibility.md) for known device limits and
[the component reference](../components/index.md) for individual props.

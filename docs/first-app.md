# Build your first app

This app lets you name a reading list and include archived books. It keeps values in React state and shows a confirmation when you press Save.

## Create the app

After [installing dependencies](getting-started.md), run this from the repository root if you have not already created Reader:

```sh
npm run create-app -- Reader
```

Replace `apps/Reader/App.js` with:

```jsx
import React, {useState} from 'react';
import {Button, Checkbox, Text, TextField, View} from 'react-kindle';

export default function App() {
  const [name, setName] = useState('Reading');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <View style={{flex: 1, padding: 24}}>
      <Text variant="h2" style={{marginBottom: 24}}>Reading list</Text>
      <TextField label="List name" value={name} onChangeText={setName}
        hint="Choose a short name." />
      <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 24}}>
        <Checkbox value={includeArchived} onValueChange={setIncludeArchived}
          accessibilityLabel="Include archived books"
          style={{width: 44, height: 44, marginRight: 16}} />
        <Text>Include archived books</Text>
      </View>
      <Button disabled={!name.trim()} onPress={() => setMessage(
        `${name.trim()}: ${includeArchived ? 'all books' : 'active books only'}`
      )}>Save</Button>
      <Text style={{marginTop: 24}}>{message}</Text>
    </View>
  );
}
```

`TextField` reports text edits through `onChangeText`. `Checkbox` reports selection through `onValueChange`. Updating React state keeps the native controls in sync. This example stores values for the current session; add persistence in your save handler when your app needs it.

## Launch it

Replace `root@kindle` with your device's SSH address:

```sh
npm run deploy:app -- apps/Reader --host root@kindle --port 22 --launch
```

Deployment detects firmware, builds the app, copies it to `/mnt/us/extensions/Reader`, and starts it. Use `--identity PATH` to choose an SSH key. Stop the app before redeploying; the deploy command refuses to overwrite a running instance.

To build without a connected device:

```sh
npm run build:app -- apps/Reader 5.19.6
```

Use your target firmware in place of `5.19.6`. The output is in `build/apps/Reader/5.19.6/`.

## Continue building

Replace `App.js` with any [component example](components/index.md) to try it on the device. Add [tabs and pages](components/tab-bar.md) for navigation or a [dialog](components/dialog.md) for confirmation.

Generated apps in `apps/` are ignored by Git. Keep your application source in its own repository. See [build and deployment](guides/build-and-deploy.md) for resources, configuration, and managed launch.

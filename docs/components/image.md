# Image

Display a bundled image or a local image URI.

![Image in a native Kindle example](../images/image-qr.png)

## Usage

Save this example as `apps/Reader/App.js` in the [starter app](../first-app.md).

```jsx
import React from 'react';
import {Image, View} from 'react-kindle';

export default function App() {
  return (
    <View style={{padding: 24}}>
      <Image source="file:///mnt/us/extensions/Reader/res/cover.png"
        style={{width: 160, height: 200}} />
    </View>
  );
}
```

## Props

| Prop | Type / default | Description |
|---|---|---|
| source | URI string, source object, or bundled asset | Required image source. |
| resizeMode | string = contain | Image fitting mode. |
| colorScheme | light (default) / dark | Explicit image color scheme. |
| invertInDarkMode | boolean = true | Invert when colorScheme is dark. |
| style | View style | Set width and height. |

Put an image at `apps/Reader/res/cover.png` before building this example. Deployment copies it to the path shown above. For a bundled asset, use `source={require("./cover.png")}`. The screenshot uses a book icon.

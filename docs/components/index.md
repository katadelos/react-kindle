---
slug: /components
---
# Components

Use these components inside a generated Kindle app. Each page has a complete `App.js` example, props, and native screenshots.

Start with [View](view.md) and [Text](text.md) for layout, [Button](button.md) for actions, and [TextField](text-field.md) for forms. Use [TabBar](tab-bar.md) with [Notebook](notebook.md) for navigation.

## Layout and navigation

- [View](view.md)
- [Text](text.md)
- [TabBar](tab-bar.md)
- [Notebook](notebook.md)
- [Page](page.md)
- [ScrollView](scroll-view.md)

## Inputs and actions

- [Button](button.md)
- [Checkbox](checkbox.md)
- [Switch](switch.md)
- [TextInput](text-input.md)
- [TextField](text-field.md)
- [Slider](slider.md)
- [RadioButton](radio-button.md)
- [RadioGroup](radio-group.md)
- [ListItem](list-item.md)

## Settings

- [SettingsRow](settings-row.md)
- [SettingsToggle](settings-toggle.md)

## Feedback

- [ProgressBar](progress-bar.md)
- [ActivityIndicator](activity-indicator.md)
- [AnimatedText](animated-text.md)
- [StarRating](star-rating.md)
- [ScrollBar](scroll-bar.md)

## Content

- [Image](image.md)
- [MarkupText](markup-text.md)
- [QRCode](qr-code.md)
- [StaticDocument](static-document.md)
- [TextMeasurement](text-measurement.md)

## Surfaces

- [Dialog](dialog.md)
- [BottomSheet](bottom-sheet.md)
- [Overlay](overlay.md)
- [Divider](divider.md)
- [SheetHandle](sheet-handle.md)

## Context

- [KindleProvider](kindle-provider.md)

## About the examples

Create the [starter app](../first-app.md), then replace `apps/Reader/App.js` with a component example. Imports and React state are included. Image and HTML examples also specify the resource file to add.

Screenshots are native captures from a Kindle Basic 2024 emulator running firmware 5.19.6 with the unified styling profile. Related controls share a capture so you can compare their appearance. Layout wrappers appear through their content; KindleProvider has no visual output.

These controls run on Kindle, not in the browser. See [compatibility](../guides/compatibility.md) for runtime requirements and device coverage.

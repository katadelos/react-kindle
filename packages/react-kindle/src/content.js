import React, {useState} from 'react';
import {Image as ReactImage, StyleSheet} from 'react-native';
import {host} from './hosts';
import {useKindle} from './context';
import {View} from './layout';
const NativeImage = host('KPPImage');
const NativeMarkup = host('KPPMarkupText');
const NativeQR = host('KPPQRCode');
const NativeHTML = host('KPPStaticHTMLView');
const NativeMeasurement = host('KPPTextMeasurementWrapper');
export function escapeMarkup(text) {
  return String(text).replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[character]));
}
export function Image({source, resizeMode = 'contain', invertInDarkMode = true, colorScheme = 'light', ...props}) {
  useKindle().require('image');
  if (!['light', 'dark'].includes(colorScheme)) throw new Error('Image colorScheme must be light or dark');
  const resolved = typeof source === 'number' ? ReactImage.resolveAssetSource(source)
    : typeof source === 'string' ? {uri: source} : source;
  if (!resolved?.uri) throw new Error('Image requires an asset or source URI');
  return <NativeImage {...props} source={resolved} resizeMode={resizeMode}
    invertModeForDarkColorScheme={invertInDarkMode && colorScheme === 'dark' ? 'invert' : 'no-invert'} />;
}
export function MarkupText({children, markup, size = 18, style, ...props}) {
  const {stock, scale, require: requireFeature} = useKindle();
  requireFeature('markupText');
  if (markup !== undefined && children !== undefined) throw new Error('Use text children or explicit markup, not both');
  if (!Number.isFinite(size) || size <= 0) throw new Error('Markup text size must be positive');
  const content = markup === undefined ? `<span font_desc="${escapeMarkup(stock.fontFamily)} ${scale(size)}px">${escapeMarkup(children || '')}</span>` : markup;
  return <NativeMarkup {...props} markup={content} style={style} />;
}
export function QRCode({value, size = 132, margin = 4, onResize, onError, style, ...props}) {
  useKindle().require('qrCode');
  if (typeof value !== 'string' || !Number.isFinite(size) || size <= 0 || !Number.isFinite(margin) || margin < 0) throw new Error('Invalid QR code value or dimensions');
  return <NativeQR {...props} value={value} size={size} margin={margin}
    style={[{width: size, height: size}, style]} onChange={event => {
      const result = event.nativeEvent?.value;
      if (result === -1) onError?.(new Error('QR code value is too long'));
      else if (Number.isFinite(result)) onResize?.(result);
    }} />;
}
export function StaticDocument({source, style, onLayout, ...props}) {
  const [bounds, setBounds] = useState(null);
  useKindle().require('staticDocument');
  const resolved = typeof source === 'string' ? {uri: source} : source;
  if (!resolved?.uri) throw new Error('StaticDocument requires an HTML source URI');
  // KPP's HTML renderer opens local filenames; unlike KPPImage it does not
  // resolve file:// URLs. Keep native-buffer identifiers unchanged.
  const uri = resolved.uri.startsWith('file:///') ? decodeURIComponent(resolved.uri.slice(7)) : resolved.uri;
  const dimensions = bounds || StyleSheet.flatten(style) || {};
  const width = resolved.width ?? (Number.isFinite(dimensions.width) ? dimensions.width : undefined);
  const height = resolved.height ?? (Number.isFinite(dimensions.height) ? dimensions.height : undefined);
  // The HTML process reads its viewport at creation; attach it after measurement.
  return <View style={style} onLayout={event => {
    const next = {width: Math.round(event.nativeEvent.layout.width), height: Math.round(event.nativeEvent.layout.height)};
    if (next.width > 0 && next.height > 0) setBounds(current =>
      current?.width === next.width && current?.height === next.height ? current : next);
    onLayout?.(event);
  }}>
    {width > 0 && height > 0 &&
      <View key={`${uri}:${width}:${height}`} style={{flex: 1}}>
        <NativeHTML {...props} source={{...resolved, uri, width, height}} style={{flex: 1}} />
      </View>}
  </View>;
}
export function TextMeasurement({children, ...props}) {
  useKindle().require('textMeasurement');
  return <NativeMeasurement {...props}>{children}</NativeMeasurement>;
}

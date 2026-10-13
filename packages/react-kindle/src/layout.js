import React from 'react';
import {View as NativeView, Text as NativeText} from 'react-native';
import {host} from './hosts';
import {useKindle} from './context';

const Wrapper = host('KPPUIViewWrapper');
const NativeNotebook = host('KPPSimpleNotebook');

// Stock KPPView uses a named native wrapper around an ordinary RN layout view.
export function View({name, disabled, accessibilityASRDefaultFocus, children, ...props}) {
  useKindle().require('view');
  return <Wrapper name={name} disabled={disabled} accessibilityASRDefaultFocus={accessibilityASRDefaultFocus}>
    <NativeView {...props}>{children}</NativeView>
  </Wrapper>;
}

export const Text = React.forwardRef(function Text({variant = 'body', size, style, ...props}, ref) {
  const {scale, stock} = useKindle();
  const type = stock.typography[variant];
  if (!type) throw new Error(`Unknown text variant: ${variant}`);
  return <NativeText {...props} ref={ref}
    style={[{fontFamily: type.fontFamily || stock.fontFamily, fontWeight: type.fontWeight || 'normal',
      color: '#000000',
      fontSize: scale(size === undefined ? type.fontSize : size),
      lineHeight: type.fixedLineHeight ? type.lineHeight : scale(size === undefined ? type.lineHeight : size * type.lineHeight / type.fontSize)}, style]} />;
});

export function Page({name, children, style, ...props}) {
  if (!name) throw new Error('Page requires a nonempty name');
  return <View {...props} collapsable={false} name={name} style={[{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}, style]}>{children}</View>;
}

export function Notebook({page, children, style, ...props}) {
  useKindle().require('notebook');
  const pages = React.Children.toArray(children);
  const names = pages.map(child => child.props?.name);
  if (pages.some(child => child.type !== Page) || new Set(names).size !== names.length || !names.includes(page)) {
    throw new Error('Notebook requires uniquely named Page children and a matching page');
  }
  // The native wrapper attaches notebooks mounted after the root window is shown.
  return <View style={[{flex: 1}, style]}>
    <NativeNotebook {...props} currPage={page} style={{flex: 1}}>{pages}</NativeNotebook>
  </View>;
}

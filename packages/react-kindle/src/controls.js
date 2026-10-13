import React from 'react';
import {View as Layout} from 'react-native';
import {Text} from './layout';
import {host} from './hosts';
import {useKindle} from './context';

const NativeButton = host('KPPUnifiedButton');
const NativeProgress = host('KPPProgressBar');
const NativeScrollBar = host('KPPScrollBar');

function Selection({type, role, value = false, disabled = false, onValueChange,
  onPressOut, accessibilityState, style, ...props}) {
  useKindle().require(role === 'switch' ? 'switch' : 'checkbox');
  return <NativeButton {...props} type={type} selected={value} disabled={disabled}
    style={[{backgroundColor: '#FFFFFF', borderColor: '#000000', borderWidth: role === 'checkbox' ? 1 : 0}, style]}
    accessibilityRole={role} accessibilityState={{...accessibilityState, checked: value, disabled}}
    onPressOut={disabled ? undefined : onPressOut}
    onClicked={event => {
      if (disabled) return;
      try { onValueChange?.(!value); } finally { onPressOut?.(event); }
    }} />;
}
export function Checkbox(props) { return <Selection {...props} type={2} role="checkbox" />; }
export function Switch(props) { return <Selection {...props} type={1} role="switch" />; }

export function ProgressBar({value = 0, style, ...props}) {
  useKindle().require('progressBar');
  if (!Number.isFinite(value)) throw new Error('ProgressBar value must be finite');
  const progress = Math.max(0, Math.min(100, value));
  return <NativeProgress {...props} progress={progress}
    accessibilityRole="progressbar" accessibilityValue={{min: 0, max: 100, now: progress}}
    style={[{width: 278, height: 28, borderWidth: 1}, style]} />;
}

export function ScrollBar({index, count, pageSize, horizontal = false,
  onForward, onBackward, ...props}) {
  useKindle().require('scrollBar');
  if (![index, count, pageSize].every(Number.isInteger) || count < 0 || pageSize < 1 || index < 0) {
    throw new Error('ScrollBar requires nonnegative integer index/count and positive pageSize');
  }
  return <NativeScrollBar {...props} currentItemIndex={Math.min(index, Math.max(0, count - pageSize))}
    totalItems={count} itemPerPage={pageSize} horizontal={horizontal} draggable={true}
    onScroll={event => {
      const direction = event.nativeEvent?.velocity?.[horizontal ? 'x' : 'y'];
      if (direction > 0) onForward?.();
      if (direction < 0) onBackward?.();
    }} />;
}

// Settings uses a labeled rectangular control on the observed KT3. This is a
// composition over the shared button, separate from KPP's pill-shaped Switch.
export function SettingsToggle({value = false, disabled = false, onValueChange,
  onLabel = 'On', offLabel = 'Off', style, ...props}) {
  const {scale, require: requireFeature} = useKindle();
  requireFeature('button');
  return <NativeButton {...props} type={0} active={false} disabled={disabled}
    accessibilityRole="switch" accessibilityState={{checked: value, disabled}}
    onClicked={() => { if (!disabled) onValueChange?.(!value); }}
    style={[{width: scale(138), height: scale(44), borderWidth: 1,
      borderRadius: 2, borderColor: disabled ? '#AAAAAA' : '#555555',
      backgroundColor: value ? '#000000' : '#FFFFFF', flexDirection: value ? 'row-reverse' : 'row',
      alignItems: 'center', padding: scale(3)}, style]}>
    <Layout style={{width: scale(26), height: scale(36), borderWidth: 1,
      borderRadius: 1, borderColor: disabled ? '#AAAAAA' : '#555555',
      backgroundColor: '#FFFFFF'}} />
    <Text variant="title" style={{flex: 1, textAlign: 'center', fontWeight: 'bold',
      backgroundColor: value ? '#000000' : '#FFFFFF',
      color: disabled ? '#AAAAAA' : value ? '#FFFFFF' : '#000000'}}>{value ? onLabel : offLabel}</Text>
  </NativeButton>;
}

export function SettingsRow({title, description, children, style}) {
  const {scale} = useKindle();
  return <Layout style={[{minHeight: scale(108), paddingVertical: scale(24), borderBottomWidth: 1,
    borderBottomColor: '#AAAAAA', flexDirection: 'row', alignItems: 'center'}, style]}>
    <Layout style={{flex: 1, paddingRight: scale(20)}}>
      <Text variant="title" style={{lineHeight: scale(26)}}>{title}</Text>
      {description ? <Text>{description}</Text> : null}
    </Layout>
    {children}
  </Layout>;
}

import React, {useRef, useState, useLayoutEffect} from 'react';
import {View as Layout} from 'react-native';
import {host} from './hosts';
import {useKindle} from './context';
import {Text} from './layout';

const Unified = host('KPPUnifiedSlider');
const Track = host('KPPSlider');
const Spinner = host('KPPSpinner');
const Bar = host('KPPBar');
const Pill = host('KPPPill');

export function Slider({value = 3, minimumValue = 0, maximumValue = 5,
  variant = 'circular', disabled = false, continuous = false, onValueChange,
  style, ...props}) {
  const {require: requireFeature} = useKindle();
  if (!['bar', 'circular', 'track'].includes(variant)) throw new Error('Slider variant must be bar, circular, or track');
  requireFeature(variant === 'track' ? 'trackSlider' : 'slider');
  if (![value, minimumValue, maximumValue].every(Number.isInteger) || minimumValue >= maximumValue) {
    throw new Error('Slider requires integer values and an increasing range');
  }
  const native = useRef(null);
  const [revision, update] = useState(0);
  const bounded = Math.max(minimumValue, Math.min(maximumValue, value));
  useLayoutEffect(() => {native.current?.setNativeProps({value: bounded});}, [bounded, revision]);
  const NativeSlider = variant === 'track' ? Track : Unified;
  return <NativeSlider {...props} ref={native}
    {...(variant === 'track' ? {} : {type: variant === 'circular' ? 1 : 0, textOffsetToButton: 12})}
    minimumValue={minimumValue} maximumValue={maximumValue} value={bounded}
    disabled={disabled} continuouslyEmitOnValueChange={continuous}
    accessibilityRole="adjustable" accessibilityValue={{min: minimumValue, max: maximumValue, now: bounded}}
    onChange={event => {
      const next = event.nativeEvent?.value;
      if (!disabled && Number.isFinite(next)) onValueChange?.(Math.max(minimumValue, Math.min(maximumValue, Math.round(next))));
      // A controlled parent may reject the native edit. Reconcile after its update.
      update(previous => previous + 1);
    }}
    style={[{width: '100%', height: variant === 'circular' ? 85 : 64}, style]} />;
}

export function ActivityIndicator({animating = true, size = 116, smooth = false,
  frameInterval = 250, label, style, ...props}) {
  useKindle().require('activityIndicator');
  if (!Number.isFinite(size) || size <= 0 || !Number.isFinite(frameInterval) || frameInterval <= 0) throw new Error('Invalid spinner size or interval');
  if (!animating) return null;
  return <Layout accessibilityState={{busy: true}} style={[{alignItems: 'center'}, style]}>
    <Spinner {...props} width={size} height={size} style={{width: size, height: size}}
      isSmoothMode={smooth} frameInterval={smooth ? Math.max(450, frameInterval) : frameInterval}
      isBackgroundTransparent={false} />
    {label ? <Text style={{marginTop: 12}}>{label}</Text> : null}
  </Layout>;
}

export function Divider({vertical = false, thickness = 1, length = '100%',
  color = '#AAAAAA', pattern = 'none', style, ...props}) {
  useKindle().require('divider');
  if (!Number.isFinite(thickness) || thickness <= 0) throw new Error('Divider thickness must be positive');
  return <Bar {...props} color={color} barOrientation={vertical ? 'vertical' : 'horizontal'}
    barThickness={thickness} barLength={length} drawingPattern={pattern}
    style={[vertical ? {width: thickness, height: length, minWidth: thickness}
      : {width: length, height: thickness, minHeight: thickness}, style]} />;
}

export function SheetHandle({direction = 'none', onSwipeUp, onSwipeDown,
  accessibilityLabel, style, ...props}) {
  useKindle().require('sheetHandle');
  if (!['none', 'up', 'down'].includes(direction)) throw new Error('Invalid sheet handle direction');
  return <Layout style={[{height: 32, alignItems: 'center'}, style]}>
    <Pill {...props} gestureDirectionHint={direction} lineThickness={4} pillWidth={58}
      arrowHeadHeightOffset={4.5} barPillYOffset={14}
      accessibilityLabel={accessibilityLabel || (direction === 'none' ? 'Sheet handle' : `Swipe ${direction}`)}
      onSwipeUp={onSwipeUp} onSwipeDown={onSwipeDown} style={{height: 32, width: 80}} />
  </Layout>;
}

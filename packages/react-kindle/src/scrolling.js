import React, {useRef, useImperativeHandle} from 'react';
import {View as Layout} from 'react-native';
import {dispatch, host} from './hosts';
import {useKindle} from './context';
const Paginated = host('KPPPaginatedScrollView');
const Controlled = host('KPPControlledScrollView');
export const ScrollView = React.forwardRef(function ScrollView({mode = 'paginated',
  horizontal = false, children, style, contentContainerStyle, onForward, onBackward,
  onScroll, onKeyPress, onMomentumScrollBegin, ...props}, ref) {
  const {require: requireFeature} = useKindle();
  if (!['paginated', 'controlled'].includes(mode)) throw new Error('ScrollView mode must be paginated or controlled');
  requireFeature(mode === 'paginated' ? 'paginatedScroll' : 'controlledScroll');
  const native = useRef(null);
  useImperativeHandle(ref, () => ({scrollTo(options) {
    if (mode !== 'controlled') throw new Error('scrollTo requires controlled mode and an exported command');
    dispatch(native, 'KPPControlledScrollView', 'scrollTo', [options]);
  }}), [mode]);
  const direction = event => {
    const delta = event.nativeEvent?.velocity?.[horizontal ? 'x' : 'y'];
    if (delta > 0) onForward?.();
    if (delta < 0) onBackward?.();
  };
  const NativeScroll = mode === 'paginated' ? Paginated : Controlled;
  return <NativeScroll fitContent={mode === 'paginated'} draggable={true}
    accessibilityKppScrollbarAccessible={false} offset={mode === 'paginated' ? 4294967295 : 0}
    scrollOnKeyPress={false} {...props} ref={native} horizontal={horizontal}
    onScroll={event => {direction(event); onScroll?.(event);}}
    onMomentumScrollBegin={onMomentumScrollBegin || direction}
    onKeyPress={event => {
      if (event.nativeEvent?.key === 'Page_Up') onBackward?.();
      if (event.nativeEvent?.key === 'Page_Down') onForward?.();
      onKeyPress?.(event);
    }} style={[style, {overflow: 'scroll'}]}>
    <Layout style={contentContainerStyle}>{children}</Layout>
  </NativeScroll>;
});

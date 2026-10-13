import React, {useRef} from 'react';
import {View as Layout} from 'react-native';
import {host} from './hosts';
import {useKindle} from './context';
import {Text} from './layout';
import {Button} from './Button';
import {SheetHandle} from './indicators';
const Window = host('KPPWindow');
const NativeOverlay = host('KPPOverlayView');
let windowSequence = 0;
function Surface({visible, children, onDismiss, sheet = false, height, style}) {
  const {applicationId, window: dimensions, require: requireFeature} = useKindle();
  const id = useRef(null);
  if (!id.current) id.current = `${applicationId || 'kindle'}.surface${++windowSequence}`;
  if (!visible) return null;
  requireFeature('window');
  return <Window title={id.current} windowType={sheet ? 'modal' : 'dialog'}
    modality="dismissibleModal" lightbox="on" hide={false}
    winMgr={{A: applicationId, owner: applicationId, flashOnShow: 2}}
    onMessage={event => {if (event.nativeEvent?.text === 'INITIATE_SHUTDOWN') onDismiss?.();}}
    style={[{position: 'absolute', width: sheet ? dimensions.width : dimensions.width * 0.865, height: height || 'auto',
      ...(sheet ? {top: Math.max(0, dimensions.height - height), left: 0} : {})}, style]}>
    {children}
  </Window>;
}
export function Dialog({visible, title, children, confirmLabel = 'OK', cancelLabel = 'Cancel',
  onConfirm, onCancel, onDismiss = onCancel, style}) {
  const {scale} = useKindle();
  return <Surface visible={visible} onDismiss={onDismiss} style={style}>
    <Layout style={{paddingHorizontal: 30, paddingTop: 30, paddingBottom: 23, backgroundColor: '#FFFFFF'}}>
      <Text variant="title" style={{marginBottom: 16}}>{title}</Text>
      {typeof children === 'string' ? <Text style={{marginBottom: 30}}>{children}</Text> : children}
      <Layout style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12}}>
        {cancelLabel ? <Button variant="secondary" style={{marginRight: scale(12)}} onPress={onCancel}>{cancelLabel}</Button> : null}
        <Button onPress={onConfirm}>{confirmLabel}</Button>
      </Layout>
    </Layout>
  </Surface>;
}
export function BottomSheet({visible, title, children, height = 360, onDismiss}) {
  return <Surface visible={visible} sheet height={height} onDismiss={onDismiss}>
    <Layout style={{backgroundColor: '#FFFFFF', height, paddingHorizontal: 25, paddingBottom: 24}}>
      <SheetHandle direction="down" onSwipeDown={onDismiss} />
      {title ? <Text variant="title" style={{marginVertical: 12}}>{title}</Text> : null}
      {children}
    </Layout>
  </Surface>;
}
export function Overlay({visible = true, children, style, ...props}) {
  useKindle().require('overlay');
  return visible ? <NativeOverlay {...props} style={[{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}, style]}>{children}</NativeOverlay> : null;
}

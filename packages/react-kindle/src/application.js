import React from 'react';
import {AppRegistry, DeviceEventEmitter, NativeModules, View as Layout} from 'react-native';
import {KindleProvider} from './context';
import {host} from './hosts';
import {getFirmwareProfile} from './profile';
import {requireFeature} from './compatibility';

const NativeWindow = host('KPPWindow');
export const Chrome = Object.freeze({automatic: 0, none: 1, status: 2, navigation: 3, full: 4});

export function registerApplication({id, component: Component, chrome = Chrome.none,
  onRequestClose, onLayout, fontScale, firmware, presentation}) {
  getFirmwareProfile(firmware, presentation);
  requireFeature(firmware, 'window');
  if (!/^com\.lab126\.[A-Za-z][A-Za-z0-9]*$/.test(id)) throw new Error('Application id must be com.lab126.NAME to match KPPSimpleLauncher --name NAME');
  const launch = NativeModules.LaunchControl;
  if (launch) requireFeature(firmware, 'managedLifecycle');
  // Native controls inherit these process defaults before their first mount.
  // Newer StyleManager implementations also require an explicit foreground.
  NativeModules.StyleManager?.setDefaultPropertyList({
    BackgroundColor: '#FFFFFF', ForegroundColor: '#000000',
    BorderColor: '#000000', BorderWidth: 0, ColorScheme: 'light',
  });
  let transition = null;
  let controller = null;
  const apply = (hidden, acknowledge) => {
    if (controller) controller(hidden, acknowledge);
    else transition = {hidden, acknowledge};
  };
  class Application extends React.Component {
    state = {hidden: !!launch, chrome, layout: null};
    setChrome = mode => {
      if (!Number.isInteger(mode) || mode < 0 || mode > 4) throw new Error('Chrome mode must be 0–4');
      this.setState({chrome: mode});
    };
    componentDidMount() {
      controller = (hidden, acknowledge) => this.setState({hidden}, acknowledge);
      if (launch) launch.reportLoadResult(0);
      if (transition) {
        const pending = transition;
        transition = null;
        controller(pending.hidden, pending.acknowledge);
      }
    }
    componentWillUnmount() { controller = null; }
    render() {
      return <KindleProvider fontScale={fontScale} firmware={firmware} presentation={presentation} applicationId={id} windowMetrics={this.state.layout} chrome={{mode: this.state.chrome, setMode: this.setChrome}}>
        <NativeWindow onLayout={event => {
          const {width, height} = event.nativeEvent.layout;
          if (width > 0 && height > 0 &&
              (width !== this.state.layout?.width || height !== this.state.layout?.height)) {
            this.setState({layout: {width, height}});
          }
          onLayout?.(event);
        }} title={id} hide={this.state.hidden} windowType="full_screen"
          useNewWindowGroup={false} lightbox="off" shouldBlurTextInputWhenTapEmptyArea={true}
          winMgr={{A: id, persistentChrome: this.state.chrome, expectKeyboard: true,
            screenReaderSupported: true, flashOnShow: 2, drawMode: 0}}
          onMessage={event => {
            if (event.nativeEvent?.text === 'INITIATE_SHUTDOWN') onRequestClose?.();
          }}
          style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
          <Layout style={this.state.layout || {flex: 1}}><Component /></Layout>
        </NativeWindow>
      </KindleProvider>;
    }
  }
  AppRegistry.registerComponent('ReactNativeFrontEnd', () => Application);
  // Install listeners during evaluation; acknowledge LOAD after root mount,
  // when the native bridge can deliver the following GO event.
  const subscriptions = launch ? [
    DeviceEventEmitter.addListener('onAppMgrGoSignal', () => apply(false, () => launch.reportGoResult(0))),
    DeviceEventEmitter.addListener('onAppMgrPauseSignal', () => apply(true, () => launch.reportPauseResult(0))),
  ] : [];
  return () => { subscriptions.forEach(subscription => subscription.remove()); controller = null; transition = null; };
}

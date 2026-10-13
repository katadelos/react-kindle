import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {Dimensions} from 'react-native';
import {getFirmwareProfile} from './profile';
import {inspectFeature, requireFeature} from './compatibility';

const Context = createContext(null);
export function KindleProvider({children, fontScale, firmware, presentation, applicationId, chrome, windowMetrics}) {
  const stock = getFirmwareProfile(firmware, presentation);
  const [runtimeWindow, setWindow] = useState(() => Dimensions.get('window'));
  const window = useMemo(() => ({...runtimeWindow, ...windowMetrics}), [runtimeWindow, windowMetrics]);
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', event => setWindow(event.window));
    return () => subscription.remove();
  }, []);
  const scale = fontScale === undefined ? window.fontScale : fontScale;
  if (!Number.isFinite(scale) || scale <= 0) throw new Error('A positive Kindle fontScale is required');
  const value = useMemo(() => ({
    stock, firmware, applicationId, chrome, window, fontScale: scale, scale: value => value * scale,
    supports: feature => inspectFeature(firmware, feature).available,
    require: feature => requireFeature(firmware, feature),
  }), [window, scale, firmware, stock, applicationId, chrome]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useKindle() {
  const value = useContext(Context);
  if (!value) throw new Error('Kindle components require a KindleProvider');
  return value;
}

export function useChrome() {
  const {chrome} = useKindle();
  if (!chrome) throw new Error('Chrome control requires registerApplication');
  return chrome;
}

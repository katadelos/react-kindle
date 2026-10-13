import {NativeModules, UIManager} from 'react-native';
import {getFirmwareProfile, firmwareProfiles} from './profile';

// Required native contracts, checked against the running process.
export const featureContracts = Object.freeze({
  windowGeometry: {module: 'ReactKindleChrome', methods: ['getViewport']},
  chromeTransport: {module: 'ReactKindleChrome', methods: ['configure', 'takeEvents']},
  chromeConfiguration: {module: 'KPPChromeConfigurationModule', methods: ['configureChrome']},
  managedLifecycle: {module: 'LaunchControl', methods: ['reportLoadResult', 'reportGoResult', 'reportPauseResult']},
  nativeStyleDefaults: {module: 'StyleManager', methods: ['setDefaultPropertyList']},
  button: {manager: 'KPPUnifiedButton', props: ['type', 'active', 'disabled'], events: ['onClicked', 'onPressIn', 'onPressOut']},
  checkbox: {manager: 'KPPUnifiedButton', props: ['type', 'selected', 'disabled'], events: ['onClicked']},
  switch: {manager: 'KPPUnifiedButton', props: ['type', 'selected', 'disabled'], events: ['onClicked']},
  view: {manager: 'KPPUIViewWrapper', props: ['name']},
  notebook: {manager: 'KPPSimpleNotebook', props: ['currPage']},
  textInput: {manager: 'KPPTextInput', props: ['text'], events: ['onMessage']},
  multilineTextInput: {manager: 'KPPMultilineTextInput', props: ['text'], events: ['onMessage']},
  progressBar: {manager: 'KPPProgressBar', props: ['progress']},
  scrollBar: {manager: 'KPPScrollBar', props: ['currentItemIndex', 'totalItems', 'itemPerPage'], events: ['onScroll']},
  slider: {manager: 'KPPUnifiedSlider', props: ['value', 'minimumValue', 'maximumValue', 'type'], events: ['onChange']},
  trackSlider: {manager: 'KPPSlider', props: ['value', 'minimumValue', 'maximumValue'], events: ['onChange']},
  radio: {manager: 'KPPUnifiedButton', props: ['type', 'selected', 'disabled'], events: ['onClicked']},
  activityIndicator: {manager: 'KPPSpinner', props: ['frameInterval', 'isSmoothMode']},
  divider: {manager: 'KPPBar', props: ['barOrientation', 'barThickness']},
  sheetHandle: {manager: 'KPPPill', props: ['gestureDirectionHint'], events: ['onSwipeUp', 'onSwipeDown']},
  image: {manager: 'KPPImage', props: ['source']},
  markupText: {manager: 'KPPMarkupText', props: ['markup']},
  qrCode: {manager: 'KPPQRCode', props: ['value'], events: ['onChange']},
  staticDocument: {manager: 'KPPStaticHTMLView', props: ['source']},
  textMeasurement: {manager: 'KPPTextMeasurementWrapper', props: ['width', 'height']},
  modalDialog: {manager: 'KPPModalDialog', props: ['headerText', 'bodyText'], events: ['onMessage']},
  overlay: {manager: 'KPPOverlayView', props: ['width', 'height']},
  paginatedScroll: {manager: 'KPPPaginatedScrollView', props: ['offset', 'horizontal']},
  controlledScroll: {manager: 'KPPControlledScrollView', props: ['offset', 'horizontal']},
  // Stock-process features are probed, never assumed available in a launcher.
  documentContent: {manager: 'DocumentContentView', props: ['source', 'bookSettings', 'annotationSettings']},
  documentThumbnail: {manager: 'DocumentThumbnail', props: ['config']},
  badgeableImage: {manager: 'BadgeableImage', props: ['source']},
  scrubber: {manager: 'KPPScrubber', props: ['currentPosition'], command: 'getCurrentPosition'},
  simpleDialog: {module: 'UIManager', methods: ['startSimpleDialog']},
  window: {manager: 'KPPWindow', props: ['title', 'hide', 'winMgr']},
  'textInput.focus': {manager: 'KPPTextInput', command: 'focus'},
  'textInput.blur': {manager: 'KPPTextInput', command: 'blur'},
  'multilineTextInput.focus': {manager: 'KPPMultilineTextInput', command: 'focus'},
  'multilineTextInput.blur': {manager: 'KPPMultilineTextInput', command: 'blur'},
  'controlledScroll.scrollTo': {manager: 'KPPControlledScrollView', command: 'scrollTo'},
});
function eventNames(config) {
  const names = new Set();
  Object.values(config.directEventTypes || {}).forEach(event => names.add(event.registrationName));
  Object.values(config.bubblingEventTypes || {}).forEach(event => {
    Object.values(event.phasedRegistrationNames || {}).forEach(name => names.add(name));
  });
  return names;
}
export function inspectFeature(firmware, feature) {
  getFirmwareProfile(firmware);
  const contract = featureContracts[feature];
  if (!contract) throw new Error(`Unknown Kindle feature: ${feature}`);
  if (contract.module) {
    const module = NativeModules[contract.module];
    const missing = contract.methods.filter(name => typeof module?.[name] !== 'function');
    return {available: missing.length === 0, reason: missing.length ? `Missing ${contract.module}: ${missing.join(', ')}` : null};
  }
  const config = UIManager.getViewManagerConfig(contract.manager);
  if (!config || Object.keys(config.NativeProps || {}).every(name => name === 'nativeID')) {
    return {available: false, reason: `${contract.manager} has no usable native contract in this process`};
  }
  const missing = (contract.props || []).filter(prop => !(prop in (config.NativeProps || {})));
  // RN merges inherited and generic event registrations when binding a host.
  const constants = UIManager.getConstants();
  const events = eventNames({directEventTypes: constants.genericDirectEventTypes,
    bubblingEventTypes: constants.genericBubblingEventTypes});
  let current = config;
  const visited = new Set();
  while (current && !visited.has(current)) {
    visited.add(current);
    eventNames(current).forEach(name => events.add(name));
    current = current.baseModuleName ? UIManager.getViewManagerConfig(current.baseModuleName) : null;
  }
  (contract.events || []).forEach(event => { if (!events.has(event)) missing.push(event); });
  if (contract.command && config.Commands?.[contract.command] == null) missing.push(contract.command);
  return {available: missing.length === 0, reason: missing.length ? `Missing ${contract.manager}: ${missing.join(', ')}` : null};
}
export function requireFeature(firmware, feature) {
  const result = inspectFeature(firmware, feature);
  if (!result.available) throw new Error(`${feature} unavailable: ${result.reason}`);
}
export function inspectCompatibility(firmware, presentation) {
  const profile = getFirmwareProfile(firmware, presentation);
  return {firmware, presentation: profile.presentation, recovered: profile.recovered,
    referenceFirmware: profile.referenceFirmware, recoveredFirmware: Object.keys(firmwareProfiles),
    features: Object.fromEntries(Object.keys(featureContracts).map(name => [name, inspectFeature(firmware, name)]))};
}

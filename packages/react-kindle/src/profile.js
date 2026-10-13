// Exact 5.16.2.1.1 stock wrapper constants.
export const stock = Object.freeze({
  firmware: '5.16.2.1.1',
  fontFamily: 'Amazon Ember',
  typography: Object.freeze({
    // Heading line heights stay fixed while font sizes follow the font scale.
    h1: {fontFamily: 'Bookerly Display', fontSize: 36, lineHeight: 56, fixedLineHeight: true},
    h2: {fontFamily: 'Bookerly Display', fontSize: 28, lineHeight: 40, fixedLineHeight: true},
    h3: {fontSize: 20, fontWeight: 'bold', lineHeight: 24, fixedLineHeight: true},
    h4: {fontFamily: 'Bookerly', fontSize: 20, fontWeight: 'bold', lineHeight: 24, fixedLineHeight: true},
    h5: {fontSize: 20, fontWeight: '500', lineHeight: 24, fixedLineHeight: true},
    h6: {fontSize: 18, fontWeight: 'bold', lineHeight: 24, fixedLineHeight: true},
    body1: {fontSize: 18, lineHeight: 24, fixedLineHeight: true},
    body2: {fontFamily: 'Bookerly', fontSize: 18, lineHeight: 24, fixedLineHeight: true},
    small: {fontSize: 16, lineHeight: 20, fixedLineHeight: true},
    title: {fontSize: 20, fontWeight: 'bold', lineHeight: 32},
    body: {fontSize: 18, fontWeight: 'normal', lineHeight: 26},
    caption: {fontSize: 16, fontWeight: 'normal', lineHeight: 24},
  }),
  button: Object.freeze({
    height: 56, minWidth: 112, borderRadius: 4, borderWidth: 2,
    paddingVertical: 15, paddingHorizontal: 20, fontSize: 18,
  }),
  primary: Object.freeze({
    background: '#000000', text: '#FFFFFF',
    pressedBackground: '#FFFFFF', pressedText: '#000000',
    disabledBackground: '#DDDDDD', disabledBorder: '#DDDDDD', disabledText: '#666666',
  }),
  secondary: Object.freeze({
    background: '#FFFFFF', text: '#000000', border: '#000000',
    pressedBackground: '#000000', pressedText: '#FFFFFF',
    disabledBorder: '#AAAAAA', disabledText: '#ACACAC',
  }),
  input: Object.freeze({width: 445, height: 111, fontDescription: 'sans normal 46'}),
});

const stock518 = Object.freeze({
  ...stock, firmware: '5.18.1.1.1',
  buttonModel: 'active-primary',
  primary: Object.freeze({...stock.primary, border: '#000000',
    disabledBackground: '#D0D0D0', disabledBorder: '#D0D0D0', disabledText: '#404040'}),
  secondary: Object.freeze({...stock.secondary, border: '#000000',
    disabledBackground: '#FFFFFF', disabledBorder: '#707070', disabledText: '#707070'}),
  input: Object.freeze({...stock.input, fontDescription: 'sans normal 10'}),
});
export const firmwareProfiles = Object.freeze({
  '5.16.2.1.1': Object.freeze({...stock, buttonModel: 'press-inversion'}),
  '5.18.1.1.1': stock518,
});
export const presentationProfiles = Object.freeze({
  classic: firmwareProfiles['5.16.2.1.1'],
  unified: stock518,
});
// Firmware selects default styling; native capabilities are checked separately.
export function getFirmwareProfile(firmware, presentation) {
  if (typeof firmware !== 'string' || !/^\d+(?:\.\d+)+$/.test(firmware)) {
    throw new Error('Firmware must be a dotted numeric release');
  }
  if (presentation && !presentationProfiles[presentation]) throw new Error(`Unknown presentation: ${presentation}`);
  const [major, minor] = firmware.split('.').map(Number);
  const selected = presentation || (major > 5 || (major === 5 && minor >= 18) ? 'unified' : 'classic');
  const base = presentationProfiles[selected];
  return {...base, firmware, presentation: selected, referenceFirmware: base.firmware,
    recovered: firmwareProfiles[firmware] === base && (!presentation || presentation === selected)};
}

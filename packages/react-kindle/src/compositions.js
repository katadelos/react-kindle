import React, {useRef, useState} from 'react';
import {View as Layout} from 'react-native';
import {host} from './hosts';
import {useKindle} from './context';
import {Text} from './layout';
import {TextInput} from './TextInput';
import {Image} from './content';
import {Divider} from './indicators';
const NativeButton = host('KPPUnifiedButton');

export function RadioButton({value = false, disabled = false, onValueChange, style, ...props}) {
  useKindle().require('radio');
  return <NativeButton {...props} type={3} selected={value} disabled={disabled}
    accessibilityRole="radio" accessibilityState={{checked: value, disabled}}
    onClicked={() => {if (!disabled && !value) onValueChange?.(true);}}
    style={[{width: 44, height: 44}, style]} />;
}
export function RadioGroup({options, value, onValueChange, disabled = false}) {
  return <Layout accessibilityRole="radiogroup">{options.map(option =>
    <ListItem key={option.value} title={option.label} disabled={disabled || option.disabled}
      onPress={() => onValueChange?.(option.value)} trailing={<RadioButton
        accessibilityLabel={option.label} value={value === option.value}
        disabled={disabled || option.disabled} onValueChange={() => onValueChange?.(option.value)} />} />
  )}</Layout>;
}

export function ListItem({title, subtitle, icon, trailing, bold = false, disabled = false,
  onPress, separator = true, style, ...props}) {
  const {scale, require: requireFeature} = useKindle();
  requireFeature('button');
  const [pressed, setPressed] = useState(false);
  const backgroundColor = pressed && !disabled ? '#000000' : '#FFFFFF';
  const color = disabled ? '#AAAAAA' : pressed ? '#FFFFFF' : '#000000';
  return <Layout>
    <NativeButton {...props} type={0} disabled={disabled} active={pressed}
      accessibilityRole="button" accessibilityLabel={title}
      onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}
      onClicked={() => {setPressed(false); if (!disabled) onPress?.();}}
      style={[{minHeight: scale(56), width: '100%', backgroundColor}, style]}>
      <Layout style={{flexDirection: 'row', alignItems: 'center', backgroundColor}}>
        {icon ? <Layout style={{width: scale(56), alignItems: 'center', backgroundColor}}><Image source={icon} style={{width: scale(24), height: scale(24)}} /></Layout> : null}
        <Layout style={{flex: 1, paddingVertical: 16, backgroundColor}}>
          <Text style={{fontWeight: bold ? 'bold' : 'normal', color, backgroundColor}}>{title}</Text>
          {subtitle ? <Text variant="caption" style={{color, backgroundColor}}>{subtitle}</Text> : null}
        </Layout>
        {trailing}
      </Layout>
    </NativeButton>
    {separator ? <Divider /> : null}
  </Layout>;
}

export function TabBar({tabs, value, onValueChange, style}) {
  const {scale, require: requireFeature} = useKindle();
  requireFeature('button');
  if (!tabs.length || new Set(tabs.map(tab => tab.value)).size !== tabs.length) throw new Error('Tabs must have unique values');
  return <Layout style={[{flexDirection: 'row'}, style]}>{tabs.map(tab =>
    <NativeButton key={tab.value} type={4} selected={value === tab.value}
      disabled={!!tab.disabled} accessibilityRole="tab" accessibilityLabel={tab.label}
      accessibilityState={{selected: value === tab.value, disabled: !!tab.disabled}}
      onClicked={() => {if (!tab.disabled) onValueChange?.(tab.value);}}
      style={{flex: 1, height: scale(56), alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{fontWeight: value === tab.value ? 'bold' : 'normal', color: tab.disabled ? '#AAAAAA' : '#000000'}}>{tab.label}</Text>
    </NativeButton>
  )}</Layout>;
}

export const TextField = React.forwardRef(function TextField({label, hint, error,
  value, defaultValue = '', onChangeText, multiline = false, style, inputStyle,
  editable = true, ...props}, ref) {
  const {scale} = useKindle();
  const input = useRef(null);
  React.useImperativeHandle(ref, () => ({focus: () => input.current.focus(), blur: () => input.current.blur()}));
  const [text, setText] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const current = value === undefined ? text : value;
  const floating = focused || current.length > 0;
  return <Layout style={style}>
    <Layout style={{borderWidth: error || focused ? 2 : 1, borderColor: editable ? '#000000' : '#AAAAAA',
      paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, minHeight: scale(multiline ? 132 : 76)}}>
      {floating ? <Text variant="caption" style={{marginBottom: 4}}>{label}</Text> : null}
      <TextInput {...props} ref={input} value={current} multiline={multiline} editable={editable}
        placeholder={floating ? '' : label}
        placeholderTextStyle={{fontFamily: 'Amazon Ember', fontSize: scale(18)}}
        onFocus={event => {setFocused(true); props.onFocus?.(event);}}
        onBlur={event => {setFocused(false); props.onBlur?.(event);}}
        onChangeText={next => {setText(next); onChangeText?.(next);}}
        style={[{width: '100%', height: scale(multiline ? 84 : 32)}, inputStyle]} />
    </Layout>
    {error || hint ? <Text variant="caption" style={{marginTop: 8}}>{error || hint}</Text> : null}
  </Layout>;
});

import React from 'react';
import {StyleSheet} from 'react-native';
import {dispatch, getHostConfig, host} from './hosts';
import {useKindle} from './context';

const Single = host('KPPTextInput');
const Multiline = host('KPPMultilineTextInput');

class Input extends React.Component {
  static defaultProps = {multiline: false, editable: true};
  input = React.createRef();
  state = {text: this.props.defaultValue || ''};
  lastNativeText = this.props.value === undefined ? this.state.text : this.props.value;
  initialText = this.lastNativeText;
  pendingText = null;
  get name() { return this.props.multiline ? 'KPPMultilineTextInput' : 'KPPTextInput'; }
  get text() { return this.props.value === undefined ? this.state.text : this.props.value; }
  focus = () => dispatch(this.input, this.name, 'focus');
  blur = () => dispatch(this.input, this.name, 'blur');
  componentDidMount() { if (this.props.autoFocus) this.focus(); }
  componentWillUnmount() {
    if (this.input.current && getHostConfig(this.name).Commands?.blur != null) this.blur();
  }
  componentDidUpdate() { this.syncText(); }
  syncText = () => {
    if (this.input.current && this.lastNativeText !== this.text) {
      const text = this.text;
      this.pendingText = text;
      this.lastNativeText = text;
      this.input.current.setNativeProps({text});
    }
  };
  change = event => {
    const text = event.nativeEvent.text;
    if (this.pendingText !== null) {
      if (text === this.pendingText) {
        this.pendingText = null;
        return;
      }
      // GTK's multiline setter emits a clear followed by the replacement.
      // Neither notification represents an edit from the keyboard.
      if (this.props.multiline && text === '') return;
      this.pendingText = null;
    }
    if (text === this.lastNativeText) return;
    this.lastNativeText = text;
    // Force a commit even if a controlled parent rejects the edit unchanged.
    this.setState({text});
    this.props.onChange?.(event);
    this.props.onChangeText?.(text);
  };
  render() {
    const {value, defaultValue, onChange, onChangeText, autoFocus, multiline,
      style, profile, textSize, fontDescription, ...props} = this.props;
    if (typeof this.text !== 'string') throw new Error('TextInput value must be a string');
    const NativeInput = multiline ? Multiline : Single;
    const {fontFamily = profile.fontFamily, fontSize = textSize, ...layoutStyle} = StyleSheet.flatten(style) || {};
    // The multiline host retains native typography. Its exported legacy font
    // description is not a reliable font override on the observed KT3.
    const fontProps = multiline && fontDescription ? {fontDescription} : {};
    return <NativeInput {...props} {...fontProps} ref={this.input} text={this.initialText} onMessage={this.change}
      style={[{width: profile.input.width, height: profile.input.height,
        ...(!multiline ? {fontFamily, fontSize} : {})}, layoutStyle]} />;
  }
}

export const TextInput = React.forwardRef(function TextInput(props, ref) {
  const theme = useKindle();
  theme.require(props.multiline ? 'multilineTextInput' : 'textInput');
  return <Input {...props} textSize={theme.scale(18)} profile={theme.stock} ref={ref} />;
});

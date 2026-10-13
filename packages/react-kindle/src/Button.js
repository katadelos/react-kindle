import React from 'react';
import {Text} from 'react-native';
import {host} from './hosts';
import {useKindle} from './context';

const NativeButton = host('KPPUnifiedButton');

// The stock 5.16 KPPButton accepts a click only between press-in and press-out.
// Native onClicked invokes the click callback before synthesizing press-out.
class ButtonInteraction extends React.Component {
  state = {pressed: false};
  down = false;
  longHandled = false;
  componentDidUpdate(previous) {
    if ((!previous.disabled && this.props.disabled) || previous.feedback !== this.props.feedback) {
      this.down = false;
      if (this.state.pressed) this.setState({pressed: false});
    }
  }
  pressIn = event => {
    if (this.props.disabled) return;
    this.down = true;
    this.longHandled = false;
    this.setState({pressed: true});
    this.props.onPressIn?.(event);
  };
  pressOut = event => {
    this.down = false;
    this.setState({pressed: false});
    if (!this.props.disabled) this.props.onPressOut?.(event);
  };
  click = event => {
    try {
      if (!this.props.disabled && !this.longHandled &&
        (this.down || this.props.theme.stock.buttonModel === 'active-primary')) this.props.onPress?.(event);
    } finally {
      this.pressOut(event);
      this.longHandled = false;
    }
  };
  longPress = event => {
    if (this.props.disabled || !this.props.onLongPress) return;
    this.down = false;
    this.longHandled = true;
    this.setState({pressed: false});
    this.props.onLongPress(event);
  };
  render() {
    const {children, variant, disabled, feedback, style, theme,
      onPress, onPressIn, onPressOut, onLongPress, ...props} = this.props;
    const {stock, scale} = theme;
    const colors = stock[variant];
    const pressed = !disabled && feedback === 'invert' && this.state.pressed;
    const active = disabled ? false : stock.buttonModel === 'active-primary' && variant === 'primary' ? !pressed : pressed;
    const {height, fontSize, ...geometry} = stock.button;
    const labelStyle = {
      fontFamily: stock.fontFamily, fontSize: scale(fontSize),
      backgroundColor: disabled ? (colors.disabledBackground || colors.background)
        : pressed ? colors.pressedBackground : colors.background,
      color: disabled ? colors.disabledText : pressed ? colors.pressedText : colors.text,
    };
    return <NativeButton {...props} type={0} active={active} disabled={disabled}
      accessibilityRole="button" accessibilityState={{...props.accessibilityState, disabled}}
      accessibilityLabel={props.accessibilityLabel || children}
      onPressIn={this.pressIn} onPressOut={this.pressOut}
      onClicked={this.click} onLongPress={this.longPress}
      style={[style, geometry, {height: scale(height), alignItems: 'center', justifyContent: 'center',
        backgroundColor: disabled ? (colors.disabledBackground || colors.background)
          : stock.buttonModel === 'active-primary' ? '#FFFFFF' : colors.background,
        borderColor: disabled ? colors.disabledBorder : (colors.border || colors.background)}]}>
      <Text accessible={false} style={labelStyle}>{children}</Text>
    </NativeButton>;
  }
}

export function Button({variant = 'primary', disabled = false, feedback = 'invert', children, ...props}) {
  const theme = useKindle();
  theme.require('button');
  if (!['primary', 'secondary'].includes(variant)) throw new Error('Button variant must be primary or secondary');
  if (!['invert', 'none'].includes(feedback)) throw new Error('Button feedback must be invert or none');
  if (typeof children !== 'string') throw new Error('Button requires a plain string label');
  return <ButtonInteraction {...props} theme={theme} variant={variant} disabled={disabled}
    feedback={feedback}>{children}</ButtonInteraction>;
}

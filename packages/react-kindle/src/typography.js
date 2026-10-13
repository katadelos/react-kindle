import React, {useEffect, useState} from 'react';
import {Text as NativeText, StyleSheet} from 'react-native';
import {Text} from './layout';
import {useKindle} from './context';

export function StarRating({value, size = 24, style, ...props}) {
  if (!Number.isFinite(value) || !Number.isFinite(size) || size <= 0) throw new Error('StarRating requires a finite value and positive size');
  const rating = Math.max(0, Math.min(5, value));
  const fraction = rating % 1;
  const full = Math.floor(rating) + (fraction >= 0.75 ? 1 : 0);
  const half = fraction > 0.25 && fraction < 0.75;
  const stars = '\uf865'.repeat(full) + (half ? '\uf846' : '') + '\uf844'.repeat(5 - full - (half ? 1 : 0));
  return <NativeText {...props} accessibilityLabel={`${rating} out of 5 stars`}
    style={[{fontFamily: 'Kindle Symbol', fontSize: size}, style]}>{stars}</NativeText>;
}
export function AnimatedText({children, pattern = '...', interval = 300,
  animating = true, style, ...props}) {
  useKindle();
  if (typeof pattern !== 'string' || !Number.isFinite(interval) || interval <= 0) throw new Error('Invalid text animation');
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!animating) return;
    const timer = setInterval(() => setFrame(value => value + 1), interval);
    return () => clearInterval(timer);
  }, [animating, interval]);
  const colors = StyleSheet.flatten(style) || {};
  const count = animating ? frame % (pattern.length + 1) : pattern.length;
  return <Text {...props} style={style}>{children}{Array.from(pattern).map((character, index) =>
    <NativeText key={index} style={{color: index < count ? colors.color || '#000000' : colors.backgroundColor || '#FFFFFF'}}>{character}</NativeText>
  )}</Text>;
}

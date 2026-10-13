import React from 'react';
import {findNodeHandle, requireNativeComponent, UIManager} from 'react-native';

const bindings = new Map();
export function getHostConfig(name) {
  const config = UIManager.getViewManagerConfig(name);
  if (!config) throw new Error(`Kindle host ${name} is unavailable in this process`);
  return config;
}

// Resolve on first mount: importing the library does not require unused managers.
export function host(name) {
  return React.forwardRef(function KindleHost(props, ref) {
    if (!bindings.has(name)) {
      getHostConfig(name);
      bindings.set(name, requireNativeComponent(name));
    }
    return React.createElement(bindings.get(name), {...props, ref});
  });
}

export function dispatch(ref, name, command, args = []) {
  const id = getHostConfig(name).Commands?.[command];
  if (id == null) throw new Error(`${name}.${command} is not exported by this firmware`);
  const tag = ref.current && findNodeHandle(ref.current);
  if (tag == null) throw new Error(`${name} must be mounted before ${command}`);
  UIManager.dispatchViewManagerCommand(tag, id, args);
}

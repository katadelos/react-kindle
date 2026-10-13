import {useEffect, useRef} from 'react';
import {NativeModules} from 'react-native';
import {useKindle} from './context';

// Title and menu configuration uses the optional ReactKindleChrome plug-in.
export function useChromeConfiguration({title, template = 'title', buttons = [], menu = [], hideBottomChrome = true}) {
  const kindle = useKindle();
  const handlers = useRef({});
  handlers.current = Object.fromEntries([...buttons, ...menu].map(item => [item.id, item.disabled ? null : item.onPress]));
  const available = kindle.supports('chromeTransport');
  const source = kindle.applicationId + '.chrome';
  const configuration = JSON.stringify({
    appId: kindle.applicationId, source,
    topNavBar: {title, template, buttons: buttons.map(({id, label = '', uri = '', alignment = 'right', disabled = false}) => ({
      id, label, uri, alignment, state: disabled ? 'disabled' : 'enabled', handling: id === 'KPP_MORE' ? 'system' : 'notifyApp',
    }))},
    systemMenu: {clientParams: {profile: {items: menu.map(({id, label, disabled = false, group = 0}) => ({
      id, label, group, source, state: disabled ? 'disabled' : 'enabled', handling: 'notifyApp',
    }))}}},
    bottomChromeConfig: {hideBottomChrome},
  });
  useEffect(() => {
    if (!available) return;
    const error = NativeModules.ReactKindleChrome.configure(source, configuration);
    if (error) throw new Error(error);
  }, [available, source, configuration]);
  useEffect(() => {
    if (!available) return;
    const timer = setInterval(() => {
      const result = NativeModules.ReactKindleChrome.takeEvents();
      if (result.startsWith('ERROR:')) { console.error(result); return; }
      JSON.parse(result).forEach(event => handlers.current[event.id]?.());
    }, 150);
    return () => clearInterval(timer);
  }, [available]);
  return {available};
}

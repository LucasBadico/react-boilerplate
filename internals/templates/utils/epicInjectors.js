import invariant from 'invariant';
import { isEmpty, isFunction, isString, conformsTo } from 'lodash';

import checkStore from './checkStore';
import { DAEMON, ONCE_TILL_UNMOUNT, RESTART_ON_REMOUNT } from './constants';

const allowedModes = [RESTART_ON_REMOUNT, DAEMON, ONCE_TILL_UNMOUNT];

const checkKey = key =>
  invariant(
    isString(key) && !isEmpty(key),
    '(src/utils...) injectEpic: Expected `key` to be a non empty string',
  );

const checkDescriptor = descriptor => {
  const shape = {
    epic: isFunction,
    mode: mode => isString(mode) && allowedModes.includes(mode),
  };
  invariant(
    conformsTo(descriptor, shape),
    '(src/utils...) injectEpic: Expected a valid epic descriptor',
  );
};

export function injectEpicFactory(store, isValid) {
  return function injectEpic(key, descriptor = {}, args) {
    if (!isValid) checkStore(store);
    const newDescriptor = {
      ...descriptor,
      mode: descriptor.mode || DAEMON,
    };
    const { epic, mode } = newDescriptor;

    checkKey(key);
    checkDescriptor(newDescriptor);

    let hasEpic = Reflect.has(store.injectedEpics, key);

    if (process.env.NODE_ENV !== 'production') {
      const oldDescriptor = store.injectedEpics[key];
      // enable hot reloading of daemon and once-till-unmount sagas
      if (hasEpic && oldDescriptor.epic !== epic) {
        // TODO: how stop epic process
        oldDescriptor.cancel();
        // store.dispatch({ type: 'EPIC_END' });
        hasEpic = false;
      }
    }

    if (
      !hasEpic ||
      (hasEpic && mode !== DAEMON && mode !== ONCE_TILL_UNMOUNT)
    ) {
      /* eslint-disable no-param-reassign */
      store.injectedEpics[key] = {
        ...newDescriptor,
        task: store.runEpics(epic, args),
        cancel: () => null,
      };
      /* eslint-enable no-param-reassign */
    }
  };
}

export function ejectEpicFactory(store, isValid) {
  return function ejectEpic(key) {
    if (!isValid) checkStore(store);

    checkKey(key);

    if (Reflect.has(store.injectedEpics, key)) {
      const descriptor = store.injectedEpics[key];
      if (descriptor.mode && descriptor.mode !== DAEMON) {
        descriptor.cancel();
        // Clean up in production; in development we need `descriptor.saga` for hot reloading
        if (process.env.NODE_ENV === 'production') {
          // Need some value to be able to detect `ONCE_TILL_UNMOUNT` sagas in `injectSaga`
          store.injectedEpics[key] = 'done'; // eslint-disable-line no-param-reassign
        }
      }
    }
  };
}

export default function getInjectors(store) {
  checkStore(store);

  return {
    injectEpic: injectEpicFactory(store, true),
    ejectEpic: ejectEpicFactory(store, true),
  };
}

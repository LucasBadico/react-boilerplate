import { conformsTo, isFunction, isObject } from 'lodash';
import invariant from 'invariant';

/**
 * Validate the shape of redux store
 */
export default function checkStore(store) {
  const shape = {
    dispatch: isFunction,
    subscribe: isFunction,
    getState: isFunction,
    replaceReducer: isFunction,
    runEpics: isFunction,
    injectedReducers: isObject,
    injectedEpics: isObject,
  };
  invariant(
    conformsTo(store, shape),
    '(src/utils...) injectors: Expected a valid redux store',
  );
}

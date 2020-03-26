/**
 * Test store addons
 */

import { browserHistory } from 'react-router-dom';
import configureStore from '../store';

describe('configureStore', () => {
  let store;

  beforeAll(() => {
    store = configureStore({}, browserHistory);
  });

  describe('injectedReducers', () => {
    it('should contain an object for reducers', () => {
      expect(typeof store.injectedReducers).toBe('object');
    });
  });

  describe('injectedEpics', () => {
    it('should contain an object for sagas', () => {
      expect(typeof store.injectedEpics).toBe('object');
    });
  });

  describe('runEpics', () => {
    it('should contain a hook for `epicMiddleware.run`', () => {
      expect(typeof store.runEpics).toBe('function');
    });
  });
});

describe('configureStore params', () => {
  it('should call window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__', () => {
    /* eslint-disable no-underscore-dangle */
    const compose = jest.fn();
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = () => compose;
    configureStore(undefined, browserHistory);
    expect(compose).toHaveBeenCalled();
    /* eslint-enable */
  });
});

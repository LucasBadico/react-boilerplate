/**
 * Test store addons
 */

import { browserHistory } from 'react-router';
import configureStore from 'store';

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
    it('should contain a hook for `sagaMiddleware.run`', () => {
      expect(typeof store.runEpics).toEqual('function');
    });
  });
});

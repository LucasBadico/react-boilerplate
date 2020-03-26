/**
 * Test injectors
 */

import { memoryHistory } from 'react-router-dom';
import { mapTo, filter } from 'rxjs/operators';
import configureStore from '../../store';
import getInjectors, {
  injectEpicFactory,
  ejectEpicFactory,
} from '../epicInjectors';
import { DAEMON, ONCE_TILL_UNMOUNT, RESTART_ON_REMOUNT } from '../constants';

const testEpic = action$ =>
  action$.pipe(
    filter(action => action.type === 'PING'),
    mapTo({ type: 'PONG' }),
  );

describe('injectors', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  let store;
  let injectEpic;
  let ejectEpic;

  describe('getInjectors', () => {
    beforeEach(() => {
      store = configureStore({}, memoryHistory);
    });

    it('should return injectors', () => {
      expect(getInjectors(store)).toEqual(
        expect.objectContaining({
          injectEpic: expect.any(Function),
          ejectEpic: expect.any(Function),
        }),
      );
    });

    it('should throw if passed invalid store shape', () => {
      Reflect.deleteProperty(store, 'dispatch');

      expect(() => getInjectors(store)).toThrow();
    });
  });

  describe('ejectEpic helper', () => {
    beforeEach(() => {
      store = configureStore({}, memoryHistory);
      injectEpic = injectEpicFactory(store, true);
      ejectEpic = ejectEpicFactory(store, true);
    });

    it('should check a store if the second argument is falsy', () => {
      const eject = ejectEpicFactory({});

      expect(() => eject('test')).toThrow();
    });

    it('should not check a store if the second argument is true', () => {
      Reflect.deleteProperty(store, 'dispatch');
      injectEpic('test', { epic: testEpic });

      expect(() => ejectEpic('test')).not.toThrow();
    });

    it("should validate epic's key", () => {
      expect(() => ejectEpic('')).toThrow();
      expect(() => ejectEpic(1)).toThrow();
    });

    it('should cancel a epic in RESTART_ON_REMOUNT mode', () => {
      const cancel = jest.fn();
      store.injectedEpics.test = { cancel, mode: RESTART_ON_REMOUNT };
      ejectEpic('test');

      expect(cancel).toHaveBeenCalled();
    });

    it('should not cancel a daemon epic', () => {
      const cancel = jest.fn();
      store.injectedEpics.test = { cancel, mode: DAEMON };
      ejectEpic('test');

      expect(cancel).not.toHaveBeenCalled();
    });

    it('should ignore epic that was not previously injected', () => {
      expect(() => ejectEpic('test')).not.toThrow();
    });

    it("should remove non daemon epic's descriptor in production", () => {
      process.env.NODE_ENV = 'production';
      injectEpic('test', { epic: testEpic, mode: RESTART_ON_REMOUNT });
      injectEpic('test1', { epic: testEpic, mode: ONCE_TILL_UNMOUNT });

      ejectEpic('test');
      ejectEpic('test1');

      expect(store.injectedEpics.test).toBe('done');
      expect(store.injectedEpics.test1).toBe('done');
      process.env.NODE_ENV = originalNodeEnv;
    });

    it("should not remove daemon epic's descriptor in production", () => {
      process.env.NODE_ENV = 'production';
      injectEpic('test', { epic: testEpic, mode: DAEMON });
      ejectEpic('test');

      expect(store.injectedEpics.test.epic).toBe(testEpic);
      process.env.NODE_ENV = originalNodeEnv;
    });

    it("should not remove daemon epic's descriptor in development", () => {
      injectEpic('test', { epic: testEpic, mode: DAEMON });
      ejectEpic('test');

      expect(store.injectedEpics.test.epic).toBe(testEpic);
    });
  });

  describe('injectEpic helper', () => {
    beforeEach(() => {
      store = configureStore({}, memoryHistory);
      injectEpic = injectEpicFactory(store, true);
      ejectEpic = ejectEpicFactory(store, true);
    });

    it('should check a store if the second argument is falsy', () => {
      const inject = injectEpicFactory({});

      expect(() => inject('test', testEpic)).toThrow();
    });

    it('it should not check a store if the second argument is true', () => {
      Reflect.deleteProperty(store, 'dispatch');

      expect(() => injectEpic('test', { epic: testEpic })).not.toThrow();
    });

    it("should validate epic's key", () => {
      expect(() => injectEpic('', { epic: testEpic })).toThrow();
      expect(() => injectEpic(1, { epic: testEpic })).toThrow();
    });

    it("should validate epic's descriptor", () => {
      expect(() => injectEpic('test')).toThrow();
      expect(() => injectEpic('test', { epic: 1 })).toThrow();
      expect(() =>
        injectEpic('test', { epic: testEpic, mode: 'testMode' }),
      ).toThrow();
      expect(() => injectEpic('test', { epic: testEpic, mode: 1 })).toThrow();
      expect(() =>
        injectEpic('test', { epic: testEpic, mode: RESTART_ON_REMOUNT }),
      ).not.toThrow();
      expect(() =>
        injectEpic('test', { epic: testEpic, mode: DAEMON }),
      ).not.toThrow();
      expect(() =>
        injectEpic('test', { epic: testEpic, mode: ONCE_TILL_UNMOUNT }),
      ).not.toThrow();
    });

    it('should pass args to epic.run', () => {
      const args = {};
      store.runEpics = jest.fn();
      injectEpic('test', { epic: testEpic }, args);

      expect(store.runEpics).toHaveBeenCalledWith(testEpic, args);
    });

    it('should not start daemon and once-till-unmount epics if were started before', () => {
      store.runEpics = jest.fn();

      injectEpic('test1', { epic: testEpic, mode: DAEMON });
      injectEpic('test1', { epic: testEpic, mode: DAEMON });
      injectEpic('test2', { epic: testEpic, mode: ONCE_TILL_UNMOUNT });
      injectEpic('test2', { epic: testEpic, mode: ONCE_TILL_UNMOUNT });

      expect(store.runEpics).toHaveBeenCalledTimes(2);
    });

    it('should start any epic that was not started before', () => {
      store.runEpics = jest.fn();

      injectEpic('test1', { epic: testEpic });
      injectEpic('test2', { epic: testEpic, mode: DAEMON });
      injectEpic('test3', { epic: testEpic, mode: ONCE_TILL_UNMOUNT });

      expect(store.runEpics).toHaveBeenCalledTimes(3);
    });

    it('should restart a epic if different implementation for hot reloading', () => {
      const cancel = jest.fn();
      store.injectedEpics.test = { epic: testEpic, cancel };
      store.runEpics = jest.fn();

      const testEpic1 = action$ =>
        action$.pipe(
          filter(action => action.type === 'PING'),
          mapTo({ type: 'PONG' }),
        );

      injectEpic('test', { epic: testEpic1 });

      expect(cancel).toHaveBeenCalledTimes(1);
      expect(store.runEpics).toHaveBeenCalledWith(testEpic1, undefined);
    });

    it('should not cancel epic if different implementation in production', () => {
      process.env.NODE_ENV = 'production';
      const cancel = jest.fn();
      store.injectedEpics.test = {
        epic: testEpic,
        task: { cancel },
        mode: RESTART_ON_REMOUNT,
      };

      const testEpic1 = action$ =>
        action$.pipe(
          filter(action => action.type === 'PING'),
          mapTo({ type: 'PONG' }),
        );

      injectEpic('test', { epic: testEpic1, mode: DAEMON });

      expect(cancel).toHaveBeenCalledTimes(0);
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should save an entire descriptor in the epic registry', () => {
      injectEpic('test', { epic: testEpic, foo: 'bar' });
      expect(store.injectedEpics.test.foo).toBe('bar');
    });
  });
});

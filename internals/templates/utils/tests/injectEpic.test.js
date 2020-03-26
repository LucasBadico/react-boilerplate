/**
 * Test injectors
 */

import { memoryHistory } from 'react-router-dom';
import { mapTo, filter } from 'rxjs/operators';
import renderer from 'react-test-renderer';
import { render } from 'react-testing-library';
import React from 'react';
import { Provider } from 'react-redux';

import configureStore from '../../store';
import injectEpic, { useInjectEpic } from '../injectEpic';
import * as epicInjectors from '../epicInjectors';

// Fixtures
const Component = () => null;

const testEpic = action$ =>
  action$.pipe(
    filter(action => action.type === 'PING'),
    mapTo({ type: 'PONG' }),
  );

describe('injectEpic decorator', () => {
  let store;
  let injectors;
  let ComponentWithEpic;

  beforeAll(() => {
    epicInjectors.default = jest.fn().mockImplementation(() => injectors);
  });

  beforeEach(() => {
    store = configureStore({}, memoryHistory);
    injectors = {
      injectEpic: jest.fn(),
      ejectEpic: jest.fn(),
    };
    ComponentWithEpic = injectEpic({
      key: 'test',
      epic: testEpic,
      mode: 'testMode',
    })(Component);
    epicInjectors.default.mockClear();
  });

  it('should inject given epic, mode, and props', () => {
    const props = { test: 'test' };
    renderer.create(
      <Provider store={store}>
        <ComponentWithEpic {...props} />
      </Provider>,
    );

    expect(injectors.injectEpic).toHaveBeenCalledTimes(1);
    expect(injectors.injectEpic).toHaveBeenCalledWith(
      'test',
      { epic: testEpic, mode: 'testMode' },
      props,
    );
  });

  it('should eject on unmount with a correct epic key', () => {
    const props = { test: 'test' };
    const renderedComponent = renderer.create(
      <Provider store={store}>
        <ComponentWithEpic {...props} />
      </Provider>,
    );
    renderedComponent.unmount();

    expect(injectors.ejectEpic).toHaveBeenCalledTimes(1);
    expect(injectors.ejectEpic).toHaveBeenCalledWith('test');
  });

  it('should set a correct display name', () => {
    expect(ComponentWithEpic.displayName).toBe('withEpic(Component)');
    expect(
      injectEpic({ key: 'test', epic: testEpic })(() => null).displayName,
    ).toBe('withEpic(Component)');
  });

  it('should propagate props', () => {
    const props = { testProp: 'test' };
    const renderedComponent = renderer.create(
      <Provider store={store}>
        <ComponentWithEpic {...props} />
      </Provider>,
    );
    const {
      props: { children },
    } = renderedComponent.getInstance();
    expect(children.props).toEqual(props);
  });
});

describe('useInjectEpic hook', () => {
  let store;
  let injectors;
  let ComponentWithEpic;

  beforeAll(() => {
    epicInjectors.default = jest.fn().mockImplementation(() => injectors);
  });

  beforeEach(() => {
    store = configureStore({}, memoryHistory);
    injectors = {
      injectEpic: jest.fn(),
      ejectEpic: jest.fn(),
    };
    ComponentWithEpic = () => {
      useInjectEpic({
        key: 'test',
        epic: testEpic,
        mode: 'testMode',
      });
      return null;
    };
    epicInjectors.default.mockClear();
  });

  it('should inject given epic and mode', () => {
    const props = { test: 'test' };
    render(
      <Provider store={store}>
        <ComponentWithEpic {...props} />
      </Provider>,
    );

    expect(injectors.injectEpic).toHaveBeenCalledTimes(1);
    expect(injectors.injectEpic).toHaveBeenCalledWith('test', {
      epic: testEpic,
      mode: 'testMode',
    });
  });

  it('should eject on unmount with a correct epic key', () => {
    const props = { test: 'test' };
    const { unmount } = render(
      <Provider store={store}>
        <ComponentWithEpic {...props} />
      </Provider>,
    );
    unmount();

    expect(injectors.ejectEpic).toHaveBeenCalledTimes(1);
    expect(injectors.ejectEpic).toHaveBeenCalledWith('test');
  });
});

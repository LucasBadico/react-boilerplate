/**
 * Create the store with dynamic reducers
 */
import { BehaviorSubject } from 'rxjs';
import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import { createEpicMiddleware, ofType } from 'redux-observable';
import { mergeMap, takeUntil } from 'rxjs/operators';
import createReducer from './create-reducers';
import createEpics from './create-epics';

export default function configureStore(initialState = {}, history) {
  let composeEnhancers = compose;

  // If Redux Dev Tools and Saga Dev Tools Extensions are installed, enable them
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'production' && typeof window === 'object') {
    /* eslint-disable no-underscore-dangle */
    if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
      composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({});
  }

  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state
  // const middlewares = [sagaMiddleware, routerMiddleware(history)];
  const epicMiddleware = createEpicMiddleware();
  const middlewares = [epicMiddleware, routerMiddleware(history)];
  const enhancers = [applyMiddleware(...middlewares)];

  const store = createStore(
    createReducer(),
    initialState,
    composeEnhancers(...enhancers),
  );
  // Extensions
  const rootEpic$ = new BehaviorSubject(createEpics());
  const hotReloadingEpic = (action$, ...rest) =>
    rootEpic$.pipe(
      mergeMap(epic =>
        epic(action$, ...rest).pipe(
          takeUntil(action$.pipe(ofType('EPIC_END'))),
        ),
      ),
    );
  epicMiddleware.run(hotReloadingEpic);
  store.runEpics = injectedEpic => rootEpic$.next(injectedEpic);
  store.injectedReducers = {}; // Reducer registry
  store.injectedEpics = {}; // Epic registry

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(createReducer(store.injectedReducers));
    });

    module.hot.accept('./epics', () => {
      store.replaceReducer(createEpics(store.injectedEpics));
    });
  }

  return store;
}

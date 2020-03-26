/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import history from 'utils/history';
import globalReducer from 'store/reducers/global-reducer';
import languageProviderReducer from 'views/LanguageProvider/store/reducers';
import * as reducers from 'store/reducers';

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */

export default function createReducer(injectedReducers = {}) {
  const rootReducer = combineReducers({
    global: globalReducer,
    language: languageProviderReducer,
    router: connectRouter(history),
    ...injectedReducers,
    ...reducers,
  });
  return rootReducer;
}

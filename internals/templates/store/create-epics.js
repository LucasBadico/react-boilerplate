/**
 * Combine all epics in this file and export the root epic.
 */
import { combineEpics } from 'redux-observable';
import * as epics from './epics';
/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */

export default function createReducer(injectedEpics = {}) {
  const rootEpic = combineEpics(
    ...Object.values({ ...epics, ...injectedEpics }),
  );
  return rootEpic;
}

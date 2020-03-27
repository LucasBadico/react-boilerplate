/**
 * Combine all epics in this file and export the root epic.
 */
import { combineEpics } from 'redux-observable';
import * as rootEpics from './epics';
/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */

export default function createEpics(epics = rootEpics) {
  return combineEpics(...Object.values({ ...epics }));
}

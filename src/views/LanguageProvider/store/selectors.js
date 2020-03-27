import { createSelector } from 'reselect';
import { initialState } from './reducers';

/**
 * Direct selector to the language domain
 */

const selectLanguage = state => state.language || initialState;

/**
 * Select the language locale
 */

const makeSelectLocale = () =>
  createSelector(
    selectLanguage,
    languageState => languageState.locale,
  );

export { selectLanguage, makeSelectLocale };

import { ofType } from 'redux-observable';
import { mapTo, switchMap, map } from 'rxjs/operators';
import { fetchData } from '../../utils/fetch-data';

export const fetchAccounts = action$ =>
  action$.pipe(
    ofType('WILL_LOAD_LIST'),
    switchMap(() =>
      fetchData({
        url: 'https://dev-api.stefanini-spark.com/accounts?pageSize=5',
      }).pipe(
        map(({ response }) => ({
          type: 'REQUEST_FULFILLED',
          on: 'list',
          data: response,
        })),
      ),
    ),
  );

export const openModal = action$ =>
  action$.pipe(
    ofType('LOAD_REPOS'),
    mapTo({
      type: 'OPEN_FORM',
      form: 'list',
    }),
  );

export const getRepos = (action$, state$) =>
  action$.pipe(
    ofType('LOAD_REPOS_'),
    switchMap(() => {
      const { username } = state$.value.home;
      if (!username) {
        throw new Error('NoUsernameProvided');
      }
      return fetchData({
        url: `https://api.github.com/users/${username}/repos?type=all&sort=updated`,
      }).pipe(
        map(({ response }) => ({
          type: 'LOAD_REPOS_SUCCESS',
          username,
          repos: response,
        })),
      );
    }),
  );

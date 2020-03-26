import { ofType } from 'redux-observable';
import { switchMap, map } from 'rxjs/operators';
import { fetchData } from 'utils/fetch-data';

export const getRepos = (action$, store) =>
  action$.pipe(
    ofType('WILL_LOAD_REPOS'),
    switchMap(() => {
      const state = store.getState();
      const { username } = state.home;
      if (!username) {
        throw new Error('NoUsernameProvided');
      }
      return fetchData({
        url: `https://api.github.com/users/${username}/repos?type=all&sort=updated`,
      }).pipe(
        map(({ response }) => ({
          type: 'REQUEST_FULFILLED',
          on: 'repos',
          data: response,
        })),
      );
    }),
  );

import createEpics from 'store/create-epics';
import { ofType } from 'redux-observable';
import { switchMap, map } from 'rxjs/operators';
import { fetchData } from 'utils/fetch-data';

export const getRepos = (action$, state$) =>
  action$.pipe(
    ofType('LOAD_REPOS'),
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

export default createEpics({
  getRepos,
});

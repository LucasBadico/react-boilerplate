/**
 * Tests for HomePage epics
 */
import { of } from 'rxjs';
import { getRepos } from '../epics';

const username = 'mxstbr';

/* eslint-disable redux-saga/yield-effects */
describe('getRepos Epic', () => {
  it('should dispatch the REQUEST_FULFILLED action if it requests the data successfully', async done => {
    const action$ = of({ type: 'LOAD_REPOS' });

    const state = { value: { home: { username } } };
    const epic$ = getRepos(action$, state);

    epic$.subscribe(({ type, username: _username, repos }) => {
      expect(type).toMatch('LOAD_REPOS_SUCCESS');
      expect(_username).toMatch(username);
      expect(repos).toBeDefined();
      done();
    });
  });

  it('should throw NoUsernameProvided error if the no username is sent', async done => {
    const action$ = of({ type: 'LOAD_REPOS' });

    const state = { value: { home: { username: undefined } } };
    const epic$ = getRepos(action$, state);

    return epic$.subscribe(done, error => {
      expect(error.message).toMatch('NoUsernameProvided');
      return done();
    });
  });

  // TODO: add a case for request error
});

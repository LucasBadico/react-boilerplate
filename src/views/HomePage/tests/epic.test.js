/**
 * Tests for HomePage sagas
 */
import { of } from 'rxjs';
// import { TestScheduler } from 'rxjs/testing';
// import { put, takeLatest } from 'redux-saga/effects';

// import { LOAD_REPOS } from 'store/constants';
// import { repoLoadingError } from 'store/actions';

// import githubData, { getRepos } from '../store/epics';
import { getRepos } from '../store/epics';

// const githubData = {};
const username = 'mxstbr';

/* eslint-disable redux-saga/yield-effects */
describe('getRepos Epic', () => {
  it('should dispatch the REQUEST_FULFILLED action if it requests the data successfully', async done => {
    const action$ = of({ type: 'WILL_LOAD_REPOS' });

    const state = { getState: () => ({ home: { username } }) };
    const epic$ = getRepos(action$, state);

    epic$.subscribe(({ type, on, data }) => {
      expect(type).toMatch('REQUEST_FULFILLED');
      expect(on).toMatch('repos');
      expect(data).toBeDefined();
      done();
    });
  });

  it('should throw NoUsernameProvided error if the no username is sent', async done => {
    const action$ = of({ type: 'WILL_LOAD_REPOS' });

    const state = { getState: () => ({ home: { username: undefined } }) };
    const epic$ = getRepos(action$, state);

    return epic$.subscribe(done, error => {
      expect(error.message).toMatch('NoUsernameProvided');
      return done();
    });
  });

  // TODO: add a case for request error
});

// describe('githubDataSaga Saga', () => {
//   const githubDataSaga = githubData();

//   it('should start task to watch for LOAD_REPOS action', () => {
//     const takeLatestDescriptor = githubDataSaga.next().value;
//     expect(takeLatestDescriptor).toEqual(takeLatest(LOAD_REPOS, getRepos));
//   });
// });

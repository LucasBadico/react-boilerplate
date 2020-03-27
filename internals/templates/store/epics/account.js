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
    ofType('WILL_LOAD_LIST'),
    mapTo({
      type: 'OPEN_FORM',
      form: 'list',
    }),
  );

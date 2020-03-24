import { ajax } from 'rxjs/ajax';

export const fetchData = (
  url,
  method = 'GET',
  body,
  responseType = 'json',
  headers = { 'Content-Type': 'application/json' },
) =>
  ajax({
    url,
    crossDomain: true,
    method,
    body,
    responseType,
    headers,
  });

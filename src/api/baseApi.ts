import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { endpoints } from '../paths';

const BASE_URL = import.meta.env.VITE_BASE_URL || '/api';

export enum TagTypes {
  GROUP = 'GROUP',
  AUTHORISED = 'AUTHORISED',
  SCORE = 'SCORE',
}

// A 401 from these is an expected answer, not an expired session.
const UNAUTHORIZED_ALLOWED_URLS: string[] = [
  endpoints.authDomain.login,
  endpoints.authDomain.signUp,
  endpoints.authDomain.isAuthenticated,
];

let onUnauthorized: () => void = () => {};

/** Registered by the app so the base query can redirect without importing the router. */
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include',
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === 'string' ? args : args.url;

  if (
    result.error?.status === 401 &&
    !UNAUTHORIZED_ALLOWED_URLS.includes(url)
  ) {
    onUnauthorized();
    api.dispatch(baseApi.util.resetApiState());
  }

  return result;
};

export const baseApi = createApi({
  tagTypes: Object.values(TagTypes),
  baseQuery: baseQueryWithAuth,
  endpoints: () => ({}),
});

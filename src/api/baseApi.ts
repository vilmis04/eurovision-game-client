import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BASE_URL || '/api';

export enum TagTypes {
  GROUP = 'GROUP',
  AUTHORISED = 'AUTHORISED',
  SCORE = 'SCORE',
}

export const baseApi = createApi({
  tagTypes: Object.values(TagTypes),
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({}),
});

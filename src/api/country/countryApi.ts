import { endpoints } from '../../paths';
import { baseApi } from '../baseApi';
import { CountryQueryParams, CountryResponse } from './countryApi.types';

const { countryDomain } = endpoints;
export const countryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCountries: build.query<CountryResponse[], CountryQueryParams>({
      query: (params) => ({
        url: countryDomain.countryList.build(params),
      }),
    }),
  }),
});

export const { useGetCountriesQuery } = countryApi;

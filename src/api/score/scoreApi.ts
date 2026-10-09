import { TagTypes, baseApi } from '../baseApi';
import { endpoints } from '../../paths';
import {
  GetScoresResponse,
  Methods,
  UpdateScoreRequestBody,
} from '../../types';

const { scoreDomain } = endpoints;
const scoreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getScores: builder.query<GetScoresResponse[], void>({
      query: () => ({
        url: scoreDomain.score,
        method: Methods.GET,
      }),
      providesTags: [TagTypes.SCORE],
    }),
    updateScore: builder.mutation<void, UpdateScoreRequestBody>({
      query: (body) => ({
        url: scoreDomain.score,
        method: Methods.PATCH,
        body,
      }),
      invalidatesTags: [TagTypes.SCORE],
    }),
  }),
});

export const { useGetScoresQuery, useUpdateScoreMutation } = scoreApi;

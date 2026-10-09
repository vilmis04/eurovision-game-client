import { endpoints } from '../../paths';
import { GameType } from '../../types';
import { baseApi } from '../baseApi';

interface GeneralInfoResponse {
  year: number;
  gameType: GameType;
  isVotingActive: boolean;
  votingEnd?: Date;
}

const { generalInfoDomain } = endpoints;
export const generalInfoApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getGeneralInfo: build.query<GeneralInfoResponse, void>({
      query: () => ({
        url: generalInfoDomain.admin,
      }),
    }),
  }),
});

export const { useGetGeneralInfoQuery } = generalInfoApi;

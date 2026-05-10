import { Box, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { BackgroundContext } from '../../components/Layout/Layout';
import { useGetGeneralInfoQuery } from '../../api/generalInfo/generalInfoApi';
import { useGetCountriesQuery } from '../../api/country/countryApi';
import { Topbar } from './Topbar/Topbar';
import { CountryRow } from './CountryRow/CountryRow';
import { styles } from './Voting.styles';
import {
  useGetScoresQuery,
  useUpdateScoreMutation,
} from '../../api/score/scoreApi';
import { FinalVoteDrawer } from './FinalVoteDrawer/FinalVoteDrawer';
import { OrderDrawer } from './OrderDrawer/OrderDrawer';
import { OrderBy } from './Voting.types';
import { orderCountries } from './Voting.utils';
import { useErrorHandler } from '../../components/ErrorOverlay/useErrorHandler';
import { GradientType } from '../../components/Background/Background';
import { Spinner } from '../../components/Spinner/Spinner';
import { useTimeLeft } from './useTimeLeft';
import { GameType } from '../../types';
import { useSearchParams } from 'react-router-dom';

export const Voting: React.FC = () => {
  const selectGradient = useContext(BackgroundContext);
  useEffect(() => {
    selectGradient(GradientType.GRADIENT2);
  }, []);

  const {
    data: generalInfo,
    isLoading: isLoadingGeneralInfo,
    isError: isGetGeneralInfoError,
    error: getGeneralInfoError,
  } = useGetGeneralInfoQuery(undefined, { pollingInterval: 15 * 1000 });
  const {
    data: countryList,
    isFetching: isFetchingCountries,
    isError: isGetCountriesError,
    error: getCountriesError,
  } = useGetCountriesQuery(
    { year: Number(generalInfo?.year), gameType: generalInfo?.gameType },
    { skip: !generalInfo }
  );
  const {
    data: scoreList,
    refetch: refetchScoreList,
    isError: isGetScoreListError,
    error: getScoreListError,
  } = useGetScoresQuery();
  const [
    updateScore,
    { isError: isUpdateScoreError, error: updateScoreError },
  ] = useUpdateScoreMutation();

  const isError =
    isUpdateScoreError ||
    isGetScoreListError ||
    isGetCountriesError ||
    isGetGeneralInfoError;

  const error =
    updateScoreError ||
    getScoreListError ||
    getCountriesError ||
    getGeneralInfoError;

  useErrorHandler({ error, isError });

  const timeLeft = useTimeLeft(generalInfo?.votingEnd);
  const isFetching = isFetchingCountries || isLoadingGeneralInfo;
  const isVotingActive = Boolean(generalInfo?.isVotingActive);
  const hasVotingTimeEnded = generalInfo?.votingEnd && timeLeft === '';

  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const orderByParam = searchParams.get('orderBy');

  const orderBy =
    orderByParam && orderByParam in OrderBy
      ? (orderByParam as OrderBy)
      : OrderBy.PERFORMANCE;

  const setOrderBy = (newOrder: OrderBy) => {
    setSearchParams({ orderBy: newOrder });
  };

  useEffect(() => {
    if (!orderByParam) {
      setOrderBy(orderBy);
    }
  }, []);

  useEffect(() => {
    refetchScoreList();
  }, [generalInfo?.gameType]);

  const scoredCountries = new Set(
    scoreList
      ?.filter(({ inFinal, position }) =>
        generalInfo?.gameType === GameType.FINAL ? position : inFinal
      )
      .map((country) => country.country)
  ).size;

  const notAvailableSpots = (scoreList || [])
    .filter(({ position }) => position)
    .map(({ position }) => position);

  const isSemiSpotAvailable =
    (scoreList || []).filter(({ inFinal }) => inFinal).length < 10;

  const votingCountry = countryList?.find(({ code }) => code === countryCode);

  const handleClose = () => {
    setCountryCode(null);
  };

  const votingScore = scoreList?.find(
    ({ country }) => country === votingCountry?.name
  ) ?? {
    country: votingCountry?.name || '',
    inFinal: Boolean(votingCountry?.orderFinal),
    position: 0,
  };

  const toggleOrderDrawer = () => setIsOrderDrawerOpen((isOpen) => !isOpen);

  const handleOrderByChange = (newOrder: OrderBy) => {
    setOrderBy(newOrder);
    toggleOrderDrawer();
  };

  const openVotingModal = useCallback(
    (code: string) => setCountryCode(code),
    []
  );

  const orderedCountryList = orderCountries(
    [...(countryList || [])],
    orderBy,
    generalInfo?.gameType,
    scoreList
  );

  return (
    <Spinner isLoading={isFetching}>
      <>
        <Box sx={styles.container}>
          <Topbar
            gameType={generalInfo?.gameType}
            selected={scoredCountries}
            endTime={generalInfo?.votingEnd}
            timeLeft={timeLeft}
            toggleOrderDrawer={toggleOrderDrawer}
          />
          <Box sx={styles.countries}>
            {orderedCountryList.map(({ name, code, artist, song }) => {
              const { inFinal, position } =
                scoreList?.find(({ country }) => country === name) || {};

              return (
                <CountryRow
                  key={name}
                  name={name}
                  code={code}
                  artist={artist}
                  song={song}
                  gameType={generalInfo?.gameType}
                  inFinal={inFinal}
                  position={position}
                  updateScore={updateScore}
                  isSemiSpotAvailable={isSemiSpotAvailable}
                  openVotingModal={openVotingModal}
                  isVotingActive={isVotingActive && !hasVotingTimeEnded}
                />
              );
            })}
            <Typography variant="body1" sx={styles.notice}>
              Your votes are saved automatically.
            </Typography>
          </Box>
        </Box>
        <FinalVoteDrawer
          countryCode={countryCode}
          handleClose={handleClose}
          updateScore={updateScore}
          notAvailableSpots={notAvailableSpots}
          votingScore={votingScore}
          votingCountry={votingCountry}
        />
        <OrderDrawer
          isOpen={isOrderDrawerOpen}
          handleClose={toggleOrderDrawer}
          orderBy={orderBy}
          handleChange={handleOrderByChange}
        />
      </>
    </Spinner>
  );
};

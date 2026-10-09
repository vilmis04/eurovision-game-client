import { CountryResponse } from '../../api/country/countryApi.types';
import { GameType, GetScoresResponse } from '../../types';
import { OrderBy } from './Voting.types';
import { calculateRemainingTime, orderCountries } from './Voting.utils';

const country = (
  name: string,
  orderSemi: number,
  orderFinal: number
): CountryResponse =>
  ({ name, orderSemi, orderFinal, code: name.slice(0, 2) } as CountryResponse);

const makeCountries = () => [
  country('Sweden', 3, 2),
  country('Albania', 1, 3),
  country('Malta', 2, 1),
];

const names = (list: CountryResponse[]) => list.map(({ name }) => name);

const score = (data: Partial<GetScoresResponse>) => data as GetScoresResponse;

describe('orderCountries', () => {
  it('returns an empty list when there are no countries', () => {
    expect(orderCountries(undefined, OrderBy.VOTING, GameType.SEMI1)).toEqual(
      []
    );
  });

  it('orders by semi performance order', () => {
    const result = orderCountries(
      makeCountries(),
      OrderBy.PERFORMANCE,
      GameType.SEMI1
    );
    expect(names(result)).toEqual(['Albania', 'Malta', 'Sweden']);
  });

  it('orders by final performance order in the final', () => {
    const result = orderCountries(
      makeCountries(),
      OrderBy.PERFORMANCE,
      GameType.FINAL
    );
    expect(names(result)).toEqual(['Malta', 'Sweden', 'Albania']);
  });

  it('orders alphabetically', () => {
    const result = orderCountries(
      makeCountries(),
      OrderBy.ALPHABETICAL,
      GameType.SEMI1
    );
    expect(names(result)).toEqual(['Albania', 'Malta', 'Sweden']);
  });

  it('puts countries voted into the final first in a semi', () => {
    const scores = [score({ country: 'Sweden', inFinal: true })];
    const result = orderCountries(
      makeCountries(),
      OrderBy.VOTING,
      GameType.SEMI1,
      scores
    );
    expect(names(result)).toEqual(['Sweden', 'Albania', 'Malta']);
  });

  it('puts voted countries first in the final, ordered by position', () => {
    const scores = [
      score({ country: 'Albania', position: 1 }),
      score({ country: 'Sweden', position: 2 }),
    ];
    const result = orderCountries(
      makeCountries(),
      OrderBy.VOTING,
      GameType.FINAL,
      scores
    );
    expect(names(result)).toEqual(['Albania', 'Sweden', 'Malta']);
  });

  it('falls back to performance order when nothing is voted', () => {
    const result = orderCountries(
      makeCountries(),
      OrderBy.VOTING,
      GameType.SEMI1,
      []
    );
    expect(names(result)).toEqual(['Albania', 'Malta', 'Sweden']);
  });
});

describe('calculateRemainingTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-05-13T20:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns an empty string without an end time', () => {
    expect(calculateRemainingTime(undefined)).toBe('');
  });

  it('formats the time left as mm:ss', () => {
    expect(calculateRemainingTime(new Date('2025-05-13T20:05:09Z'))).toBe(
      '05:09'
    );
  });

  it('shows zero at the deadline', () => {
    expect(calculateRemainingTime(new Date('2025-05-13T20:00:00Z'))).toBe(
      '00:00'
    );
  });

  it('returns an empty string once the deadline has passed', () => {
    expect(calculateRemainingTime(new Date('2025-05-13T19:59:00Z'))).toBe('');
  });
});

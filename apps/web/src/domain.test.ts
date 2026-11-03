import { describe, expect, it } from 'vitest';
import {
  calculateRentalTotal,
  createBooking,
  filterListings,
  isListing,
  parsePersistedState,
  seedListings,
  type ListingFilters,
} from './domain';

const filters: ListingFilters = { query: '', category: 'all', mode: 'all', sort: 'recommended' };
const contact = { contactName: '演示用户', contactPhone: '13800000000' };
const now = new Date('2026-11-03T12:00:00.000Z');

describe('marketplace discovery', () => {
  it('combines category, mode, location, and trimmed search without mutating the seed', () => {
    const originalOrder = seedListings.map((listing) => listing.id);
    const result = filterListings(seedListings, {
      ...filters,
      query: ' 青禾 ',
      category: 'tractor',
      mode: 'rent',
      location: '山东',
      sort: 'price-desc',
    });
    expect(result.map((listing) => listing.id)).toEqual(['tractor-01']);
    expect(seedListings.map((listing) => listing.id)).toEqual(originalOrder);
    expect(filterListings(seedListings, { ...filters, query: '不存在的农场' })).toEqual([]);
  });

  it('finds text in all public discovery fields and supports case-insensitive model names', () => {
    expect(filterListings(seedListings, { ...filters, query: 'pro988q' })[0]?.id).toBe(
      'harvester-01',
    );
    expect(filterListings(seedListings, { ...filters, query: '江苏' })).toHaveLength(2);
    expect(filterListings(seedListings, { ...filters, query: '免耕' })[0]?.id).toBe('implement-02');
  });

  it('orders prices within a selected transaction mode and newest by timestamp', () => {
    const result = filterListings(seedListings, { ...filters, mode: 'rent', sort: 'price-asc' });
    expect(result[0]?.id).toBe('implement-01');
    expect(result.at(-1)?.id).toBe('harvester-01');
    expect(filterListings(seedListings, { ...filters, sort: 'newest' })[0]?.id).toBe(
      'implement-02',
    );
  });
});

describe('rental quote', () => {
  it('includes both first and last days, including same-day bookings', () => {
    expect(calculateRentalTotal(680, '2026-11-03', '2026-11-03')).toBe(680);
    expect(calculateRentalTotal(680, '2026-11-03', '2026-11-05')).toBe(2040);
  });

  it('counts calendar days across leap day and daylight-saving boundaries', () => {
    expect(calculateRentalTotal(100, '2028-02-28', '2028-03-01')).toBe(300);
    expect(calculateRentalTotal(100, '2027-03-13', '2027-03-15')).toBe(300);
    expect(calculateRentalTotal(100, '2026-10-31', '2026-11-02')).toBe(300);
  });

  it.each(['2026-02-29', '2026-02-30', '2026-13-01', '2026-1-03', '', 'not-a-date'])(
    'rejects malformed calendar date %j',
    (date) => {
      expect(() => calculateRentalTotal(100, date, '2026-11-03')).toThrow();
    },
  );

  it('rejects reversed dates and unsafe or nonpositive amounts', () => {
    expect(() => calculateRentalTotal(100, '2026-11-04', '2026-11-03')).toThrow('结束日期');
    for (const amount of [0, -1, 1.5, NaN, Infinity]) {
      expect(() => calculateRentalTotal(amount, '2026-11-03', '2026-11-03')).toThrow();
    }
    expect(() =>
      calculateRentalTotal(Number.MAX_SAFE_INTEGER, '2026-11-03', '2026-11-04'),
    ).toThrow();
  });
});

describe('demo transaction intent', () => {
  it('creates a rental request with a locally calculated quote and normalized contact', () => {
    const booking = createBooking(
      seedListings[0]!,
      { ...contact, contactName: ' 演示用户 ', startDate: '2026-11-03', endDate: '2026-11-05' },
      now,
    );
    expect(booking).toMatchObject({
      listingId: 'tractor-01',
      mode: 'rent',
      total: 2040,
      status: 'requested',
      contactName: '演示用户',
    });
  });

  it('creates a purchase intent without rental dates', () => {
    const booking = createBooking(seedListings[3]!, contact, now);
    expect(booking.total).toBe(56800);
    expect(booking.startDate).toBeUndefined();
  });

  it('rejects missing contacts, past starts, and incomplete rental periods', () => {
    expect(() =>
      createBooking(
        seedListings[0]!,
        { ...contact, startDate: '2026-11-02', endDate: '2026-11-05' },
        now,
      ),
    ).toThrow('早于今天');
    expect(() => createBooking(seedListings[0]!, contact, now)).toThrow('起止日期');
    expect(() => createBooking(seedListings[3]!, { ...contact, contactName: ' ' }, now)).toThrow(
      '联系人',
    );
    expect(() => createBooking(seedListings[3]!, { ...contact, contactPhone: '123' }, now)).toThrow(
      '手机号',
    );
  });
});

describe('browser-storage recovery', () => {
  it('recovers from malformed JSON and wrong root types', () => {
    for (const value of [null, '', '{broken', 'null', '[]', '5']) {
      expect(parsePersistedState(value)).toEqual({ favorites: [], listings: [], bookings: [] });
    }
  });

  it('retains valid records while dropping invalid entries and duplicate favorites', () => {
    const booking = createBooking(seedListings[3]!, contact, now);
    const state = parsePersistedState(
      JSON.stringify({
        favorites: ['tractor-01', 3, null, 'tractor-01', ''],
        listings: [seedListings[0], { ...seedListings[1], price: -10 }, null],
        bookings: [booking, { ...booking, total: -1 }, { ...booking, status: 'paid' }],
      }),
    );
    expect(state.favorites).toEqual(['tractor-01']);
    expect(state.listings).toHaveLength(1);
    expect(state.bookings).toEqual([booking]);
  });

  it('rejects unsafe media paths, invalid specs and impossible stored rental dates', () => {
    expect(seedListings.every(isListing)).toBe(true);
    expect(isListing({ ...seedListings[0], image: 'javascript:alert(1)' })).toBe(false);
    expect(isListing({ ...seedListings[0], specs: { power: 99 } })).toBe(false);
    const booking = createBooking(
      seedListings[0]!,
      { ...contact, startDate: '2026-11-03', endDate: '2026-11-05' },
      now,
    );
    expect(
      parsePersistedState(JSON.stringify({ bookings: [{ ...booking, startDate: '2026-02-30' }] }))
        .bookings,
    ).toEqual([]);
  });

  it('deduplicates stored record IDs to keep card and request identity unambiguous', () => {
    const booking = createBooking(seedListings[3]!, contact, now);
    const state = parsePersistedState(
      JSON.stringify({
        listings: [seedListings[0], seedListings[0]],
        bookings: [booking, booking],
      }),
    );
    expect(state.listings).toHaveLength(1);
    expect(state.bookings).toHaveLength(1);
  });
});

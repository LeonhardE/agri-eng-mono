const seeds = require('../data/listings');
const i18n = require('./i18n');

const categories = ['tractor', 'harvester', 'implement', 'drone'];
const modes = ['rent', 'buy'];
const locales = ['zh', 'ug', 'kk'];
const VERSION = '0.1.1 · MP-001';
const LIMIT = 100;

function emptyState() {
  return { schemaVersion: 1, locale: 'zh', favorites: [], listings: [], intents: [] };
}

function text(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const stamp = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === value;
}

function today(now) {
  const date = now || new Date();
  return [
    date.getFullYear(),
    ('0' + (date.getMonth() + 1)).slice(-2),
    ('0' + date.getDate()).slice(-2),
  ].join('-');
}

function rentalTotal(price, start, end) {
  if (!validDate(start) || !validDate(end)) throw new Error('dateInvalid');
  if (end < start) throw new Error('dateOrder');
  const days = (Date.parse(end + 'T00:00:00Z') - Date.parse(start + 'T00:00:00Z')) / 86400000 + 1;
  const total = days * price;
  if (!Number.isSafeInteger(price) || price <= 0 || !Number.isSafeInteger(total))
    throw new Error('priceInvalid');
  return { days, total };
}

function unique(items) {
  const ids = new Set();
  return items
    .filter((item) => {
      if (ids.has(item.id)) return false;
      ids.add(item.id);
      return true;
    })
    .slice(0, LIMIT);
}

function validListing(value) {
  return (
    record(value) &&
    text(value.id, 100) &&
    value.id.indexOf('local-') === 0 &&
    text(value.title, 80) &&
    text(value.location, 80) &&
    text(value.description, 1000) &&
    categories.includes(value.category) &&
    modes.includes(value.mode) &&
    Number.isSafeInteger(value.price) &&
    value.price > 0 &&
    value.price <= 100000000 &&
    locales.includes(value.contentLanguage) &&
    typeof value.createdAt === 'string' &&
    Number.isFinite(Date.parse(value.createdAt))
  );
}

function validIntent(value) {
  const seed = record(value) && seeds.find((item) => item.id === value.listingId);
  if (
    !seed ||
    !text(value.id, 100) ||
    value.id.indexOf('intent-') !== 0 ||
    typeof value.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(value.createdAt))
  )
    return false;
  if (seed.mode === 'buy')
    return value.total === seed.price && value.start === '' && value.end === '';
  try {
    return value.total === rentalTotal(seed.price, value.start, value.end).total;
  } catch {
    return false;
  }
}

function sanitize(raw) {
  const state = emptyState();
  if (!record(raw) || raw.schemaVersion !== 1) return state;
  state.locale = locales.includes(raw.locale) ? raw.locale : 'zh';
  state.favorites = Array.isArray(raw.favorites)
    ? [...new Set(raw.favorites.filter((id) => seeds.some((item) => item.id === id)))].slice(
        0,
        LIMIT,
      )
    : [];
  state.listings = Array.isArray(raw.listings)
    ? unique(raw.listings.filter(validListing)).map((item) => ({
        id: item.id,
        title: item.title,
        location: item.location,
        description: item.description,
        category: item.category,
        mode: item.mode,
        price: item.price,
        contentLanguage: item.contentLanguage,
        createdAt: item.createdAt,
      }))
    : [];
  state.intents = Array.isArray(raw.intents)
    ? unique(raw.intents.filter(validIntent)).map((item) => ({
        id: item.id,
        listingId: item.listingId,
        total: item.total,
        start: item.start,
        end: item.end,
        createdAt: item.createdAt,
      }))
    : [];
  return state;
}

function createListing(input, now) {
  if (
    !record(input) ||
    !text(input.title, 80) ||
    !text(input.location, 80) ||
    !text(input.description, 1000)
  )
    throw new Error('listingInvalid');
  if (
    !categories.includes(input.category) ||
    !modes.includes(input.mode) ||
    !locales.includes(input.contentLanguage)
  )
    throw new Error('listingInvalid');
  if (
    !/^\d{1,9}$/.test(String(input.price)) ||
    Number(input.price) <= 0 ||
    Number(input.price) > 100000000
  )
    throw new Error('priceInvalid');
  const date = now || new Date();
  return {
    id: 'local-' + date.getTime() + '-' + Math.random().toString(36).slice(2, 8),
    title: input.title.trim(),
    location: input.location.trim(),
    description: input.description.trim(),
    category: input.category,
    mode: input.mode,
    price: Number(input.price),
    contentLanguage: input.contentLanguage,
    createdAt: date.toISOString(),
  };
}

function createIntent(id, input, now) {
  const seed = seeds.find((item) => item.id === id);
  if (!seed) throw new Error('missing');
  const date = now || new Date();
  let start = '';
  let end = '';
  let total = seed.price;
  if (seed.mode === 'rent') {
    start = input.start;
    end = input.end;
    total = rentalTotal(seed.price, start, end).total;
    if (start < today(date)) throw new Error('datePast');
  }
  return {
    id: 'intent-' + date.getTime() + '-' + Math.random().toString(36).slice(2, 8),
    listingId: id,
    total,
    start,
    end,
    createdAt: date.toISOString(),
  };
}

function filterListings(filters) {
  const query = (filters.query || '').trim().toLowerCase();
  const result = seeds.filter(
    (item) =>
      (!filters.category || filters.category === 'all' || filters.category === item.category) &&
      (!filters.mode || filters.mode === 'all' || filters.mode === item.mode) &&
      (!filters.region || filters.region === 'all' || item.location.includes(filters.region)) &&
      (!filters.savedOnly || (filters.favorites || []).includes(item.id)) &&
      (!query ||
        [
          item.title,
          item.subtitle,
          item.farm,
          item.location,
          ...locales.flatMap((locale) => [
            i18n.translateSeedText(item.title, locale),
            i18n.translateSeedText(item.subtitle, locale),
            i18n.labels(locale)[item.category],
          ]),
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)),
  );
  if (filters.sort === 'newest') result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  // Daily rent and sale price have different units. Never sort them together.
  if (filters.mode !== 'all' && filters.sort === 'priceAsc')
    result.sort((a, b) => a.price - b.price);
  if (filters.mode !== 'all' && filters.sort === 'priceDesc')
    result.sort((a, b) => b.price - a.price);
  return result;
}

function money(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

module.exports = {
  seeds,
  categories,
  modes,
  locales,
  VERSION,
  LIMIT,
  emptyState,
  sanitize,
  createListing,
  createIntent,
  filterListings,
  rentalTotal,
  today,
  money,
};

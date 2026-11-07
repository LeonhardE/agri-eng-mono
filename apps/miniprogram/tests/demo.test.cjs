const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const domain = require('../miniprogram/utils/domain');
const { createStore, KEY } = require('../miniprogram/utils/store');
const i18n = require('../miniprogram/utils/i18n');

const now = new Date('2026-11-06T12:00:00Z');
const rent = domain.seeds.find((item) => item.mode === 'rent');
const buy = domain.seeds.find((item) => item.mode === 'buy');
const input = {
  title: '虚构拖拉机',
  price: '500',
  location: '新疆 · 伊犁',
  description: '只用于演示',
  category: 'tractor',
  mode: 'rent',
  contentLanguage: 'zh',
};

function memoryStorage() {
  const values = new Map();
  return {
    values,
    getStorageSync: (key) => values.get(key),
    setStorageSync: (key, value) => values.set(key, structuredClone(value)),
  };
}

test('rent uses inclusive calendar dates across DST and leap day', () => {
  assert.deepEqual(domain.rentalTotal(500, '2026-10-31', '2026-11-02'), { days: 3, total: 1500 });
  assert.deepEqual(domain.rentalTotal(500, '2028-02-28', '2028-03-01'), { days: 3, total: 1500 });
  assert.equal(domain.rentalTotal(500, '2026-11-06', '2026-11-06').total, 500);
});

test('invalid dates, reverse ranges, overflow and past intentions are rejected', () => {
  for (const invalid of ['2026-02-29', '2026-11-31', '', '2026-1-1'])
    assert.throws(() => domain.rentalTotal(500, invalid, '2026-12-01'), /dateInvalid/);
  assert.throws(() => domain.rentalTotal(500, '2026-11-07', '2026-11-06'), /dateOrder/);
  assert.throws(
    () => domain.rentalTotal(Number.MAX_SAFE_INTEGER, '2026-11-06', '2026-11-07'),
    /priceInvalid/,
  );
  assert.throws(
    () => domain.createIntent(rent.id, { start: '2026-11-05', end: '2026-11-08' }, now),
    /datePast/,
  );
});

test('purchase intent takes a fixture price and never records contact or payment data', () => {
  const intent = domain.createIntent(
    buy.id,
    { total: 1, contactPhone: 'secret', start: '2026-11-06' },
    now,
  );
  assert.equal(intent.total, buy.price);
  assert.equal(intent.start, '');
  assert.equal(intent.end, '');
  assert(!('contactPhone' in intent));
  assert.throws(() => domain.createIntent('local-not-live', {}, now), /missing/);
});

test('search/category/region/mode filters combine and do not mutate fixtures', () => {
  const ids = domain.seeds.map((item) => item.id);
  assert.deepEqual(domain.filterListings({ query: '不存在的农机', mode: 'all' }), []);
  const result = domain.filterListings({
    query: '  ' + rent.title + ' ',
    category: rent.category,
    mode: rent.mode,
    region: rent.location.split(' · ')[0],
  });
  assert(result.some((item) => item.id === rent.id));
  const sorted = domain.filterListings({ mode: 'rent', sort: 'priceAsc' });
  assert(sorted.every((item, index) => index === 0 || sorted[index - 1].price <= item.price));
  assert.deepEqual(
    domain.filterListings({ mode: 'all', sort: 'priceAsc' }).map((item) => item.id),
    ids,
  );
  assert.deepEqual(
    domain.seeds.map((item) => item.id),
    ids,
  );
});

test('simulated publication validates fields, keeps the original language, and stays private', () => {
  const listing = domain.createListing({ ...input, contentLanguage: 'ug' }, now);
  assert.equal(listing.contentLanguage, 'ug');
  assert(!domain.filterListings({ mode: 'all' }).some((item) => item.id === listing.id));
  for (const price of ['0', '-1', '1.5', '1e3', 'Infinity', '100000001'])
    assert.throws(() => domain.createListing({ ...input, price }, now), /priceInvalid/);
  assert.throws(() => domain.createListing({ ...input, title: '   ' }, now), /listingInvalid/);
  assert.throws(() => domain.createListing({ ...input, category: 'other' }, now), /listingInvalid/);
});

test('storage decoding drops corrupt rows, forged totals, duplicate IDs and unknown fields', () => {
  const listing = domain.createListing(input, now);
  const intent = domain.createIntent(buy.id, {}, now);
  const state = domain.sanitize({
    schemaVersion: 1,
    locale: 'unknown',
    favorites: [rent.id, rent.id, 'fake'],
    listings: [null, listing, listing, { ...listing, id: 'local-forged', price: -2 }],
    intents: [
      { ...intent, id: 'intent-forged', total: 1 },
      { ...intent, contactPhone: 'discard' },
      intent,
    ],
  });
  assert.equal(state.locale, 'zh');
  assert.deepEqual(state.favorites, [rent.id]);
  assert.equal(state.listings.length, 1);
  assert.equal(state.intents.length, 1);
  assert(!('contactPhone' in state.intents[0]));
  for (const raw of [null, 'corrupt', [], { schemaVersion: 2 }])
    assert.deepEqual(domain.sanitize(raw), domain.emptyState());
});

test('favorites/publications/intent deletion and restart persist without touching other keys', () => {
  const storage = memoryStorage();
  storage.values.set('other-app', 'keep');
  let store = createStore(storage);
  store.toggleFavorite(rent.id);
  store.addListing(input);
  store.addIntent(buy.id, {});
  store.setLocale('kk');
  store = createStore(storage);
  assert.equal(store.get().locale, 'kk');
  assert.deepEqual(store.get().favorites, [rent.id]);
  assert.equal(store.get().listings.length, 1);
  store.removeIntent(store.get().intents[0].id);
  store.removeListing(store.get().listings[0].id);
  assert.equal(createStore(storage).get().intents.length, 0);
  store.reset();
  assert.deepEqual(createStore(storage).get(), domain.emptyState());
  assert.equal(storage.values.get('other-app'), 'keep');
  assert.equal(store.getResetEpoch(), 1);
});

test('failed writes preserve the previous state, including a failed reset', () => {
  const storage = memoryStorage();
  const store = createStore(storage);
  store.toggleFavorite(rent.id);
  const before = store.get();
  const originalWrite = storage.setStorageSync;
  storage.setStorageSync = () => {
    throw new Error('quota');
  };
  assert.throws(() => store.addListing(input), /storageError/);
  assert.throws(() => store.reset(), /storageError/);
  assert.deepEqual(store.get(), before);
  assert.equal(store.getResetEpoch(), 0);
  assert.equal(store.hasError(), true);
  storage.setStorageSync = originalWrite;
  store.reset();
  assert.equal(store.hasError(), false);
});

test('an unreadable store is surfaced without pretending to have saved anything', () => {
  const store = createStore({
    getStorageSync() {
      throw new Error('unavailable');
    },
    setStorageSync() {
      throw new Error('unavailable');
    },
  });
  assert.deepEqual(store.get(), domain.emptyState());
  assert.equal(store.hasError(), true);
  assert.throws(() => store.setLocale('ug'), /storageError/);
});

test('all interface labels have complete three-language demo copy', () => {
  for (const locale of domain.locales) {
    const ui = i18n.labels(locale);
    assert(Object.values(ui).every((value) => typeof value === 'string' && value.length > 0));
    for (const key of Object.keys(i18n.sources)) {
      if (locale !== 'zh')
        assert.notEqual(ui[key], i18n.sources[key], key + ' translation missing in ' + locale);
    }
  }
});

test('localized native modal buttons stay within the four-character platform limit', () => {
  for (const locale of domain.locales) {
    const ui = i18n.labels(locale);
    for (const label of [ui.cancel, ui.confirm])
      assert(label.length > 0 && label.length <= 4, locale + ' modal label exceeds native limit');
  }
});

function loadPage(name, app, wx) {
  const file = path.resolve(__dirname, '../miniprogram/pages', name, 'index.js');
  let page;
  vm.runInNewContext(
    fs.readFileSync(file, 'utf8'),
    {
      require: (id) => require(path.resolve(path.dirname(file), id)),
      Page(value) {
        page = value;
      },
      getApp: () => app,
      wx,
      console,
    },
    { filename: file },
  );
  page.data = structuredClone(page.data);
  page.setData = (patch) => {
    for (const [key, value] of Object.entries(patch)) {
      const parts = key.split('.');
      let target = page.data;
      for (const part of parts.slice(0, -1)) target = target[part];
      target[parts.at(-1)] = value;
    }
  };
  return page;
}

test('cached validation errors follow the interface language and stay cleared after editing', () => {
  const store = createStore(memoryStorage());
  const app = { demo: store };
  global.getApp = () => app;
  global.wx = { setNavigationBarTitle() {} };
  try {
    const publish = loadPage('publish', app, global.wx);
    const intent = loadPage('intent', app, global.wx);
    intent.onLoad({ id: rent.id });
    for (const page of [publish, intent]) {
      page.onShow();
      page.submit();
    }
    for (const locale of ['zh', 'ug', 'kk', 'zh']) {
      store.setLocale(locale);
      publish.onShow();
      intent.onShow();
      assert.equal(publish.data.error, i18n.labels(locale).listingInvalid);
      assert.equal(intent.data.error, i18n.labels(locale).dateInvalid);
    }
    publish.input({ currentTarget: { dataset: { field: 'title' } }, detail: { value: 'Demo' } });
    intent.date({
      currentTarget: { dataset: { field: 'start' } },
      detail: { value: '2026-11-08' },
    });
    store.setLocale('kk');
    publish.onShow();
    intent.onShow();
    assert.equal(publish.data.error, '');
    assert.equal(intent.data.error, '');
    publish.submit();
    assert.equal(publish.data.error, i18n.labels('kk').listingInvalid);
  } finally {
    delete global.getApp;
    delete global.wx;
  }
});

test('page workflow saves publication, favorite and purchase intent; guards duplicate submit', () => {
  const store = createStore(memoryStorage());
  // Shared helpers execute in the Node context, like the native app singleton.
  global.getApp = () => ({ demo: store });
  global.wx = { setNavigationBarTitle() {} };
  try {
    const app = { demo: store };
    const publish = loadPage('publish', app, global.wx);
    publish.onShow();
    publish.submit();
    assert.equal(store.get().listings.length, 0);
    assert(publish.data.error);
    publish.sample();
    publish.submit();
    publish.submit();
    assert.equal(store.get().listings.length, 1);
    const detail = loadPage('detail', app, global.wx);
    detail.onLoad({ id: buy.id });
    detail.onShow();
    detail.favorite();
    assert(store.get().favorites.includes(buy.id));
    const intent = loadPage('intent', app, global.wx);
    intent.onLoad({ id: buy.id });
    intent.onShow();
    intent.submit();
    intent.submit();
    assert.equal(store.get().intents.length, 1);
    const mine = loadPage('mine', app, global.wx);
    mine.onShow();
    assert.equal(mine.data.intents[0].total, buy.price);
    assert.equal(mine.data.listings.length, 1);
    store.reset();
    publish.onShow();
    intent.onShow();
    mine.onShow();
    assert.equal(publish.data.form.title, '');
    assert.equal(intent.data.saved, false);
    assert.equal(mine.data.intents.length, 0);
  } finally {
    delete global.getApp;
    delete global.wx;
  }
});

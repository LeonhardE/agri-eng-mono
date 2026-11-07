const domain = require('./domain');
const KEY = 'heji-mp-demo-v1';

function createStore(storage) {
  let state = domain.emptyState();
  let storageError = false;
  let resetEpoch = 0;
  try {
    state = domain.sanitize(storage.getStorageSync(KEY));
  } catch {
    storageError = true;
  }

  function save(next) {
    const clean = domain.sanitize(next);
    // Commit memory only after persistence, so a failed write never claims success.
    try {
      storage.setStorageSync(KEY, clean);
    } catch {
      storageError = true;
      throw new Error('storageError');
    }
    state = clean;
    storageError = false;
  }

  return {
    get() {
      return JSON.parse(JSON.stringify(state));
    },
    hasError() {
      return storageError;
    },
    getResetEpoch() {
      return resetEpoch;
    },
    setLocale(locale) {
      if (!domain.locales.includes(locale)) throw new Error('missing');
      save({ ...state, locale });
    },
    toggleFavorite(id) {
      if (!domain.seeds.some((item) => item.id === id)) throw new Error('missing');
      save({
        ...state,
        favorites: state.favorites.includes(id)
          ? state.favorites.filter((value) => value !== id)
          : [...state.favorites, id],
      });
    },
    addListing(input) {
      if (state.listings.length >= domain.LIMIT) throw new Error('limit');
      save({ ...state, listings: [domain.createListing(input), ...state.listings] });
    },
    addIntent(id, input) {
      if (state.intents.length >= domain.LIMIT) throw new Error('limit');
      save({ ...state, intents: [domain.createIntent(id, input), ...state.intents] });
    },
    removeListing(id) {
      save({ ...state, listings: state.listings.filter((item) => item.id !== id) });
    },
    removeIntent(id) {
      save({ ...state, intents: state.intents.filter((item) => item.id !== id) });
    },
    reset() {
      save(domain.emptyState());
      resetEpoch += 1;
    },
  };
}

module.exports = { createStore, KEY };

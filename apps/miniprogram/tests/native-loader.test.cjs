const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('app and every page start using JS-only native module resolution', () => {
  const root = path.resolve(__dirname, '../miniprogram');
  const cache = new Map();
  const stored = new Map();
  let app;
  let definition;
  const wx = {
    getStorageSync: (key) => stored.get(key),
    setStorageSync: (key, value) => stored.set(key, value),
    setNavigationBarTitle() {},
  };
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const requireNative = (id) => {
      assert(id.startsWith('.'), 'No Node or third-party runtime dependencies');
      const resolved = path.resolve(path.dirname(file), id.endsWith('.js') ? id : id + '.js');
      assert(resolved.startsWith(root + path.sep), 'Import outside mini program root');
      assert(fs.existsSync(resolved), 'Native module not found: ' + id);
      return load(resolved);
    };
    const context = {
      module,
      exports: module.exports,
      require: requireNative,
      App: (value) => {
        app = value;
      },
      Page: (value) => {
        definition = value;
      },
      getApp: () => app,
      wx,
      console,
    };
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
    return module.exports;
  }
  load(path.join(root, 'app.js'));
  app.onLaunch();
  for (const route of JSON.parse(fs.readFileSync(path.join(root, 'app.json'))).pages) {
    load(path.join(root, route + '.js'));
    const page = definition;
    page.setData = (patch) => {
      Object.assign(page.data, patch);
    };
    if (page.onLoad) page.onLoad({ id: 'tractor-01' });
    page.onShow();
    assert.equal(typeof page.data.ui.find, 'string', route + ' should initialize UI');
    if (route.includes('market')) assert.equal(page.data.listings.length, 8);
  }
});

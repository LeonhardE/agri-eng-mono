const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const project = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(project, 'project.config.json')));
const root = path.resolve(project, config.miniprogramRoot);
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json')));
const ui = require('../miniprogram/utils/i18n').labels('zh');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

let size = 0;
for (const file of walk(root)) {
  const source = fs.readFileSync(file, 'utf8');
  size += fs.statSync(file).size;
  if (file.endsWith('.js')) {
    new vm.Script(source, { filename: file });
    assert(
      !/wx\.(cloud|request|login|getLocation|uploadFile|connectSocket)\b/.test(source),
      `Unexpected backend or network API: ${file}`,
    );
    for (const match of source.matchAll(/require\(['"](\.[^'"]+)['"]\)/g)) {
      assert(!match[1].endsWith('.json'), `Native mini program require cannot load JSON: ${file}`);
      const target = path.resolve(path.dirname(file), match[1]);
      assert(
        ['', '.js'].some((extension) => fs.existsSync(target + extension)),
        `Missing import: ${target}`,
      );
    }
  }
  if (file.endsWith('.json')) JSON.parse(source);
  if (file.endsWith('.wxml')) {
    for (const match of source.matchAll(/\bui\.(\w+)/g))
      assert(match[1] in ui, `Missing interface copy: ${match[1]}`);
  }
}

for (const page of app.pages) {
  for (const extension of ['.js', '.json', '.wxml', '.wxss'])
    assert(
      fs.existsSync(path.join(root, page + extension)),
      `Incomplete page: ${page}${extension}`,
    );
}
for (const component of [...Object.values(app.usingComponents), '/custom-tab-bar/index']) {
  for (const extension of ['.js', '.json', '.wxml', '.wxss'])
    assert(
      fs.existsSync(path.join(root, component + extension)),
      `Incomplete component: ${component}${extension}`,
    );
}
for (const item of require('../miniprogram/data/listings'))
  assert(fs.existsSync(path.join(root, item.image)), `Missing fixture image: ${item.image}`);
assert.equal(app.tabBar.custom, true);
assert(size < 2 * 1024 * 1024, `Source payload exceeds conservative 2 MiB budget: ${size}`);
console.log(
  `Checked ${app.pages.length} native pages, local dependencies and offline assets; source payload ${(size / 1024).toFixed(1)} KiB / 2048 KiB.`,
);
console.log(
  'This is a source check. DevTools compilation and physical-device acceptance are separate checks.',
);

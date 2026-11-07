const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');

// Stage only packaged demo source and public AppID config. No credentials or local IDE files.
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'miniprogram');
const config = JSON.parse(fs.readFileSync(path.join(root, 'project.config.json'), 'utf8'));
const privatePath = path.join(root, 'project.private.config.json');
const local = fs.existsSync(privatePath) ? JSON.parse(fs.readFileSync(privatePath, 'utf8')) : {};
const appid = process.argv[2] || local.appid || config.appid;
assert(
  /^wx[a-f0-9]{16}$/.test(appid),
  'Select the official DevTools Test Account or pass an authorized AppID. Guest AppIDs are not supported.',
);
const destination = path.join(
  process.platform === 'darwin' ? '/private/tmp' : fs.realpathSync(os.tmpdir()),
  'heji-mp-simulator',
);
// A fixed system-temp staging directory stays separate from the repository and user documents.
assert(destination !== root && !root.startsWith(destination + path.sep));
fs.mkdirSync(destination, { recursive: true });
const stagedSource = path.join(destination, 'miniprogram');
assert(!fs.lstatSync(destination).isSymbolicLink(), 'Staging directory must not be a symlink.');
if (fs.existsSync(stagedSource)) {
  assert(!fs.lstatSync(stagedSource).isSymbolicLink(), 'Staged source must not be a symlink.');
  fs.rmSync(stagedSource, { recursive: true });
}
fs.cpSync(source, stagedSource, { recursive: true });
fs.writeFileSync(
  path.join(destination, 'project.config.json'),
  JSON.stringify({ ...config, appid }, null, 2) + '\n',
);
console.log('Simulator project: ' + destination);
console.log(
  'Re-run after source changes, then refresh this project in DevTools. This does not upload or publish.',
);

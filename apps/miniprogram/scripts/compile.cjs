const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Optional offline check with the compilers shipped in official WeChat DevTools.
// A successful run is template/style validation, not simulator or phone acceptance.
const tools =
  process.argv[2] ||
  '/Applications/wechatwebdevtools.app/Contents/Resources/app.asar.unpacked/node_modules/wcc-exec';
const root = path.resolve(__dirname, '../miniprogram');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'heji-mp-compile-'));

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [path.relative(root, file)];
  });
}

try {
  const files = walk(root);
  for (const [binary, extension] of [
    ['wcc', '.wxml'],
    ['wcsc', '.wxss'],
  ]) {
    const executable = path.join(tools, binary + (process.platform === 'win32' ? '.exe' : ''));
    if (!fs.existsSync(executable))
      throw new Error(
        'Official compiler not found. Pass the installed DevTools compiler directory as the first argument.',
      );
    const sources = files.filter((file) => file.endsWith(extension));
    const result = spawnSync(executable, ['-o', path.join(output, binary + '.js'), ...sources], {
      cwd: root,
      encoding: 'utf8',
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(binary + ': ' + result.stderr);
    if (result.stderr.trim()) process.stderr.write(result.stderr);
    console.log(binary + ': compiled ' + sources.length + ' ' + extension + ' files successfully.');
  }
} finally {
  fs.rmSync(output, { recursive: true, force: true });
}

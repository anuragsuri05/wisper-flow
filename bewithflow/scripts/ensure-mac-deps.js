'use strict';
// sharp (needed by the speech engine) ships one native package per CPU. npm only installs the
// host's, so add the other Mac architecture before packaging an Intel or Apple Silicon build.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sharpPkg = require(path.join(root, 'node_modules', 'sharp', 'package.json'));
const want = [];
for (const cpu of ['x64', 'arm64']) {
  for (const name of [`@img/sharp-darwin-${cpu}`, `@img/sharp-libvips-darwin-${cpu}`]) {
    const version = sharpPkg.optionalDependencies?.[name];
    if (version && !fs.existsSync(path.join(root, 'node_modules', name))) want.push({ name, version, cpu });
  }
}
// npm refuses to install another CPU's package directly (EBADPLATFORM), so fetch the
// published tarball and unpack it into node_modules ourselves.
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'bwf-deps-'));
for (const { name, version } of want) {
  console.log(`adding ${name}@${version}`);
  const file = execFileSync('npm', ['pack', `${name}@${version}`, '--silent'], { cwd: tmp }).toString().trim().split('\n').pop();
  const dest = path.join(root, 'node_modules', name);
  fs.mkdirSync(dest, { recursive: true });
  execFileSync('tar', ['-xzf', path.join(tmp, file), '-C', dest, '--strip-components=1']);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log('Mac native dependencies ready for x64 and arm64');

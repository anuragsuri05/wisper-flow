'use strict';
// Verifies the packaged macOS apps in dist/: signature, CPU architecture of every native
// binary, Info.plist permissions, bundled helper, and runs `--self-test` on the build that
// matches this Mac's CPU.   Usage: npm run selftest:mac
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
const hostArch = process.arch === 'arm64' ? 'arm64' : 'x64';
let failures = 0;
const result = (ok, msg) => {
  if (!ok) failures++;
  console.log(`  ${ok ? '✓' : '✗'} ${msg}`);
};

for (const [dir, arch] of [['mac', 'x64'], ['mac-arm64', 'arm64']]) {
  const app = path.join(dist, dir, 'bewithflow.app');
  if (!fs.existsSync(app)) {
    console.log(`\n${arch}: not built (${app})`);
    continue;
  }
  console.log(`\n${arch === 'x64' ? 'Intel' : 'Apple Silicon'} build: ${path.relative(process.cwd(), app)}`);
  const machArch = arch === 'x64' ? 'x86_64' : 'arm64';
  const archOf = (file) => sh('lipo', ['-archs', file]);

  try {
    sh('codesign', ['--verify', '--deep', '--strict', app]);
    const info = execFileSync('codesign', ['-dv', app], { stdio: ['ignore', 'pipe', 'pipe'] });
    result(true, 'code signature valid');
  } catch (err) {
    result(false, `code signature: ${String(err.stderr || err.message).split('\n')[0]}`);
  }
  const sig = (() => {
    try {
      execFileSync('codesign', ['-dv', app], { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch {}
    try {
      return execFileSync('codesign', ['-dvv', app], { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    } catch (e) {
      return String(e.stderr || '');
    }
  })();
  const sigText = sig || sh('sh', ['-c', `codesign -dvv "${app}" 2>&1`]);
  result(true, `signed as: ${/Authority=Developer ID[^\n]*/.exec(sigText)?.[0] || (/adhoc/.test(sigText) ? 'ad-hoc (no Developer ID certificate)' : 'unknown')}`);
  result(/flags=.*runtime/.test(sigText), 'hardened runtime enabled');

  const binaries = {
    'main executable': path.join(app, 'Contents/MacOS/bewithflow'),
    'ONNX Runtime binding': path.join(app, `Contents/Resources/app.asar.unpacked/node_modules/onnxruntime-node/bin/napi-v3/darwin/${arch}/onnxruntime_binding.node`),
    'sharp': path.join(app, `Contents/Resources/app.asar.unpacked/node_modules/@img/sharp-darwin-${arch}/lib/sharp-darwin-${arch}.node`),
    'key helper': path.join(app, 'Contents/Resources/bwf-keyhook'),
  };
  for (const [name, file] of Object.entries(binaries)) {
    if (!fs.existsSync(file)) {
      result(false, `${name}: missing (${path.relative(app, file)})`);
      continue;
    }
    const archs = archOf(file);
    result(archs.split(' ').includes(machArch), `${name}: ${archs}`);
  }
  const plist = sh('plutil', ['-p', path.join(app, 'Contents/Info.plist')]);
  for (const key of ['NSMicrophoneUsageDescription', 'NSAppleEventsUsageDescription', 'LSMinimumSystemVersion']) result(plist.includes(key), `Info.plist has ${key}`);
  for (const gone of ['onnxruntime-web', 'onnxruntime-node/bin/napi-v3/linux', 'onnxruntime-node/bin/napi-v3/win32']) {
    result(!fs.existsSync(path.join(app, 'Contents/Resources/app.asar.unpacked/node_modules', gone)), `not shipped: ${gone}`);
  }
  const dmg = fs.readdirSync(dist).find((f) => f.endsWith(`mac-${arch}.dmg`));
  if (dmg) result(true, `installer: dist/${dmg} (${(fs.statSync(path.join(dist, dmg)).size / 1e6).toFixed(0)} MB)`);

  if (arch === hostArch) {
    try {
      const env = { ...process.env };
      delete env.ELECTRON_RUN_AS_NODE; // set by VS Code terminals; would start the app as plain Node
      const out = execFileSync(path.join(app, 'Contents/MacOS/bewithflow'), ['--self-test'], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000, env }).toString();
      const report = JSON.parse(out.slice(out.indexOf('{')));
      for (const [name, c] of Object.entries(report.checks)) result(c.ok, `self-test ${name}: ${c.detail}`);
    } catch (err) {
      result(false, `self-test failed: ${String(err.stdout || err.message).slice(0, 300)}`);
    }
  } else {
    console.log(`  · self-test skipped: this Mac is ${hostArch}; run it on an ${arch === 'arm64' ? 'Apple Silicon' : 'Intel'} Mac`);
  }
}
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);

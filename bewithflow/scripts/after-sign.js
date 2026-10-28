'use strict';
// electron-builder afterSign hook.
//  - With a Developer ID certificate and Apple credentials in the environment, notarizes the app
//    (APPLE_ID + APPLE_APP_SPECIFIC_PASSWORD + APPLE_TEAM_ID, or APPLE_API_KEY + APPLE_API_KEY_ID + APPLE_API_ISSUER).
//  - Without a certificate, applies an ad-hoc signature: Apple Silicon refuses to run unsigned apps,
//    and an ad-hoc signed app opens after the user approves it in System Settings → Privacy & Security.
const { execFileSync } = require('child_process');
const path = require('path');

module.exports = async function afterSign(context) {
  if (context.electronPlatformName !== 'darwin') return;
  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  // codesign prints its details on stderr
  const details = require('child_process').spawnSync('codesign', ['-dvv', appPath], { encoding: 'utf8' }).stderr || '';
  const signed = /Authority=Developer ID Application/.test(details);

  if (!signed) {
    console.log('  • no Developer ID certificate: applying an ad-hoc signature');
    execFileSync('codesign', ['--force', '--deep', '--sign', '-', '--options', 'runtime', '--entitlements', path.join(__dirname, '..', 'build', 'entitlements.mac.plist'), appPath], { stdio: 'inherit' });
    return;
  }

  const env = process.env;
  const creds = env.APPLE_API_KEY
    ? { appleApiKey: env.APPLE_API_KEY, appleApiKeyId: env.APPLE_API_KEY_ID, appleApiIssuer: env.APPLE_API_ISSUER }
    : env.APPLE_ID
      ? { appleId: env.APPLE_ID, appleIdPassword: env.APPLE_APP_SPECIFIC_PASSWORD, teamId: env.APPLE_TEAM_ID }
      : null;
  if (!creds) {
    console.log('  • signed, but no Apple notarization credentials in the environment: skipping notarization');
    return;
  }
  console.log('  • notarizing with Apple (this takes a few minutes)…');
  const { notarize } = require('@electron/notarize');
  await notarize({ appPath, ...creds });
  console.log('  • notarized');
};

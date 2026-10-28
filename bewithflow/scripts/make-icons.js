'use strict';
// Renders build/icon.svg to build/icon.png (1024) and build/icon.icns, using Electron's renderer.
// Run: npm run build:icons
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const BUILD = path.join(__dirname, '..', 'build');
const svg = fs.readFileSync(path.join(BUILD, 'icon.svg'), 'utf8');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1024, height: 1024, show: false, transparent: true, frame: false, webPreferences: { offscreen: true } });
  const html = `<html><body style="margin:0;background:transparent">${svg}</body></html>`;
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  await new Promise((r) => setTimeout(r, 300));
  const png = (await win.webContents.capturePage({ x: 0, y: 0, width: 1024, height: 1024 })).resize({ width: 1024, height: 1024 }).toPNG();
  fs.writeFileSync(path.join(BUILD, 'icon.png'), png);

  const set = path.join(BUILD, 'icon.iconset');
  fs.rmSync(set, { recursive: true, force: true });
  fs.mkdirSync(set);
  for (const size of [16, 32, 128, 256, 512]) {
    for (const scale of [1, 2]) {
      const px = size * scale;
      const name = `icon_${size}x${size}${scale === 2 ? '@2x' : ''}.png`;
      execFileSync('sips', ['-z', String(px), String(px), path.join(BUILD, 'icon.png'), '--out', path.join(set, name)], { stdio: 'ignore' });
    }
  }
  execFileSync('iconutil', ['-c', 'icns', set, '-o', path.join(BUILD, 'icon.icns')]);
  fs.rmSync(set, { recursive: true, force: true });
  console.log('wrote build/icon.png and build/icon.icns');
  app.quit();
});

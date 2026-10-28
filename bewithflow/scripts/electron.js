'use strict';
// Runs Electron with ELECTRON_RUN_AS_NODE removed (VS Code terminals set it, which makes
// Electron behave as plain Node).  Usage: node scripts/electron.js <entry> [args...]
const { spawn } = require('child_process');
const path = require('path');
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const child = spawn(require('electron'), process.argv.slice(2), { stdio: 'inherit', env, cwd: path.join(__dirname, '..') });
child.on('exit', (code) => process.exit(code ?? 0));

'use strict';

// Put text at the cursor of whatever app is focused: copy to the clipboard,
// send the OS paste keystroke, then put the user's previous clipboard back.

const { clipboard } = require('electron');
const { execFile } = require('child_process');

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: 4000 }, (err, _out, stderr) => (err ? reject(new Error(stderr || err.message)) : resolve()));
  });
}

function sendPasteKeystroke() {
  switch (process.platform) {
    case 'darwin':
      return run('osascript', ['-e', 'tell application "System Events" to keystroke "v" using command down']);
    case 'win32':
      return run('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')",
      ]);
    default:
      return run('xdotool', ['key', '--clearmodifiers', 'ctrl+v']);
  }
}

/**
 * @param {object} [o]
 * @param {() => Promise<boolean>} [o.nativePaste]  fast Cmd+V from the key helper; falls back to the OS script
 * @returns {Promise<{pasted: boolean, error?: string}>}
 */
async function pasteText(text, { restoreClipboard = true, nativePaste = null } = {}) {
  const previous = restoreClipboard ? { text: clipboard.readText(), html: clipboard.readHTML(), image: clipboard.readImage() } : null;
  clipboard.writeText(text);
  try {
    if (!(nativePaste && (await nativePaste()))) await sendPasteKeystroke();
  } catch (err) {
    // Leave the text on the clipboard so the user can paste it manually.
    return { pasted: false, error: err.message };
  }
  if (previous) {
    setTimeout(() => {
      if (clipboard.readText() !== text) return; // the user copied something else meanwhile
      if (!previous.image.isEmpty()) clipboard.writeImage(previous.image);
      else if (previous.html) clipboard.write({ text: previous.text, html: previous.html });
      else clipboard.writeText(previous.text);
    }, 1200); // chat apps like WhatsApp read the clipboard a beat after the keystroke
  }
  return { pasted: true };
}

module.exports = { pasteText };

'use strict';

// Draws the bewithflow mark (five level-meter bars) as a PNG at runtime,
// so the app needs no binary assets.

const zlib = require('zlib');

const CRC = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
const crc32 = (buf) => {
  let c = -1;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/** @param {number} size px  @param {[number,number,number]} rgb */
function markPng(size, rgb = [0, 0, 0]) {
  const heights = [0.36, 0.66, 1, 0.58, 0.3];
  const barW = size / 9;
  const gap = (size - barW * 5) / 6;
  const px = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    px[row] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      let a = 0;
      heights.forEach((h, i) => {
        const x0 = gap + i * (barW + gap);
        const half = (h * size * 0.82) / 2;
        const inX = x + 0.5 >= x0 && x + 0.5 <= x0 + barW;
        const inY = Math.abs(y + 0.5 - size / 2) <= half;
        if (inX && inY) a = 255;
      });
      const o = row + 1 + x * 4;
      px[o] = rgb[0];
      px[o + 1] = rgb[1];
      px[o + 2] = rgb[2];
      px[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(px)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

module.exports = { markPng };

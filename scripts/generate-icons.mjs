// Gera ícones PWA (PNG) sem dependências: pinta RGBA e codifica com zlib.
// Visual: fundo verde noturno + bola branca com leve sombra dourada.
import zlib from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function makeIcon(size) {
  const px = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const ballR = size * 0.3;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // fundo verde noturno com gradiente radial sutil
      const dBg = Math.hypot(x - cx, y - cy) / (size * 0.7);
      const base = 1 - Math.min(1, dBg) * 0.5;
      px[i] = Math.round(13 * base + 8);
      px[i + 1] = Math.round(40 * base + 14);
      px[i + 2] = Math.round(24 * base + 8);
      px[i + 3] = 255;
      // bola branca
      const d = Math.hypot(x - cx, y - cy);
      if (d < ballR) {
        const shade = 1 - (d / ballR) * 0.25;
        px[i] = Math.round(255 * shade);
        px[i + 1] = Math.round(255 * shade);
        px[i + 2] = Math.round(255 * shade);
      } else if (d < ballR + size * 0.03) {
        // glow dourado
        const t = 1 - (d - ballR) / (size * 0.03);
        px[i] = Math.round(px[i] * (1 - t) + 255 * t);
        px[i + 1] = Math.round(px[i + 1] * (1 - t) + 210 * t);
        px[i + 2] = Math.round(px[i + 2] * (1 - t) + 60 * t);
      }
    }
  }
  return encodePNG(size, size, px);
}

mkdirSync(new URL('../public/', import.meta.url), { recursive: true });
const out = (name) => new URL(`../public/${name}`, import.meta.url);
writeFileSync(out('icon-192.png'), makeIcon(192));
writeFileSync(out('icon-512.png'), makeIcon(512));
writeFileSync(out('apple-touch-icon.png'), makeIcon(180));
console.log('icons generated: 192, 512, apple-touch (180)');

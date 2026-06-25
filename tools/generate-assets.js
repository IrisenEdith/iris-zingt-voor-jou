const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const outDir = path.join(__dirname, "..", "assets");
fs.mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function png(width, height, pixel, fileName) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const i = row + 1 + x * 4;
      const c = pixel(x / (width - 1), y / (height - 1), x, y);
      raw[i] = clamp(c[0]);
      raw[i + 1] = clamp(c[1]);
      raw[i + 2] = clamp(c[2]);
      raw[i + 3] = c[3] == null ? 255 : clamp(c[3]);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const file = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  fs.writeFileSync(path.join(outDir, fileName), file);
}

function clamp(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function mixColor(a, b, t) {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function noise(x, y, seed = 1) {
  const n = Math.sin((x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453);
  return n - Math.floor(n);
}

function glow(x, y, cx, cy, radius) {
  const d = Math.hypot(x - cx, y - cy);
  return Math.max(0, 1 - d / radius);
}

function imagePixel(palette, seed, extra = () => [0, 0, 0]) {
  return (x, y) => {
    const sky = mixColor(palette.top, palette.mid, Math.min(1, y * 1.35));
    const sea = mixColor(palette.mid, palette.bottom, Math.max(0, (y - 0.42) / 0.58));
    let c = y < 0.54 ? sky : sea;
    const sun = glow(x, y, palette.sunX, palette.sunY, palette.sunR);
    c = mixColor(c, palette.sun, sun * 0.7);
    const prism = Math.max(0, Math.sin((x + y * 0.6 + seed) * 18) * 0.5 + 0.5) * glow(x, y, 0.72, 0.28, 0.58);
    c = mixColor(c, hsl(310 + x * 130, 84, 72), prism * 0.14);
    const waves = Math.sin((y * 42 + Math.sin(x * 12 + seed) * 2) + seed) * 0.5 + 0.5;
    c = mixColor(c, [255, 255, 255], (y > 0.55 ? waves * 0.05 : 0) + noise(x, y, seed) * 0.035);
    const e = extra(x, y);
    return [c[0] + e[0], c[1] + e[1], c[2] + e[2], 255];
  };
}

const palettes = {
  sunset: {
    top: [43, 49, 96],
    mid: [242, 140, 95],
    bottom: [32, 112, 142],
    sun: [255, 232, 154],
    sunX: 0.42,
    sunY: 0.38,
    sunR: 0.35,
  },
  pearl: {
    top: [255, 251, 244],
    mid: [244, 204, 154],
    bottom: [92, 164, 181],
    sun: [255, 239, 187],
    sunX: 0.65,
    sunY: 0.34,
    sunR: 0.42,
  },
  rose: {
    top: [80, 48, 90],
    mid: [246, 133, 124],
    bottom: [26, 92, 126],
    sun: [255, 215, 137],
    sunX: 0.52,
    sunY: 0.42,
    sunR: 0.36,
  },
};

png(1200, 675, imagePixel(palettes.sunset, 3, (x, y) => {
  const terrace = y > 0.76 ? (y - 0.76) * 220 : 0;
  const palm = x > 0.78 && y < 0.8 ? -glow(x, y, 0.91, 0.25, 0.42) * 38 : 0;
  return [terrace + palm, terrace * 0.75 + palm, terrace * 0.45 + palm];
}), "video-poster.png");

const covers = [
  ["album-golden-hour.png", palettes.pearl, 8],
  ["album-rainbow-letters.png", palettes.rose, 12],
  ["album-malta-heart.png", palettes.sunset, 19],
];
covers.forEach(([name, pal, seed], idx) => {
  png(900, 900, imagePixel(pal, seed, (x, y) => {
    const vignette = -Math.pow(Math.hypot(x - 0.5, y - 0.5), 1.4) * 65;
    const ring = Math.abs(Math.hypot(x - 0.5, y - 0.5) - (0.28 + idx * 0.035)) < 0.008 ? 82 : 0;
    const ribbon = Math.sin((x * 2.2 + y * 1.4 + idx) * Math.PI) > 0.97 ? 55 : 0;
    return [vignette + ring + ribbon, vignette + ring * 0.82 + ribbon * 0.7, vignette + ring * 0.42 + ribbon];
  }), name);
});

for (let i = 1; i <= 6; i++) {
  const pal = [palettes.sunset, palettes.pearl, palettes.rose][i % 3];
  png(760, 940, imagePixel(pal, i * 17, (x, y) => {
    const stone = y > 0.64 ? Math.sin((x + y) * 34 + i) * 18 : 0;
    const flare = glow(x, y, 0.2 + (i % 3) * 0.25, 0.2 + (i % 2) * 0.22, 0.18) * 80;
    return [stone + flare, stone * 0.75 + flare * 0.82, stone * 0.55 + flare * 0.56];
  }), `gallery-${i}.png`);
}

function wav(fileName) {
  const sampleRate = 44100;
  const seconds = 24;
  const samples = sampleRate * seconds;
  const data = Buffer.alloc(samples * 2);
  const notes = [261.63, 329.63, 392.0, 493.88, 523.25];
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const phase = Math.floor(t / 4) % 4;
    const env = Math.min(1, t / 2) * Math.min(1, (seconds - t) / 3);
    let v = 0;
    for (let n = 0; n < 4; n++) {
      const f = notes[(n + phase) % notes.length] / (n === 0 ? 2 : 1);
      v += Math.sin(2 * Math.PI * f * t) * (0.13 / (n + 1));
    }
    v += Math.sin(2 * Math.PI * 880 * t + Math.sin(t * 1.8) * 0.4) * 0.025;
    const s = Math.max(-1, Math.min(1, v * env));
    data.writeInt16LE(Math.round(s * 32767), i * 2);
  }

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(outDir, fileName), Buffer.concat([header, data]));
}

wav("iris-preview.wav");

console.log("Generated artwork and audio in assets/");

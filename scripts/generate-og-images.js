const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const songs = [
  { id: 'dit-ben-ik',                   title: 'Dit ben ik',                   sub: 'Eerste single',   cover: 'assets/dit-ben-ik.webp',                    desc: 'Mijn eerste single. Een eerlijke muzikale kennismaking met wie ik ben.' },
  { id: 'van-alle-mensen',              title: 'Van alle mensen',              sub: 'Tweede single',   cover: 'assets/van-alle-mensen.webp',               desc: 'Over die ene persoon die alles anders maakt.' },
  { id: 'als-het-jou-niet-was-geweest', title: 'Als het jou niet was geweest', sub: 'Derde single',    cover: 'assets/als-het-jou-niet-was-geweest.webp',  desc: 'Een ode aan de mensen die ons vormen.' },
  { id: 'jij-bent-mijn-thuis',         title: 'Jij bent mijn thuis',         sub: 'Single',          cover: 'assets/jij-bent-mijn-thuis.webp',           desc: 'Thuis is niet een plek. Thuis ben jij.' },
  { id: 'mijn-hart-kent-de-weg',       title: 'Mijn hart kent de weg',       sub: 'Single',          cover: 'assets/mijn-hart-kent-de-weg.webp',         desc: 'Zelfs als ik de weg kwijt ben, weet mijn hart de weg.' },
  { id: 'als-jij-hier-niet-bent',      title: 'Als jij hier niet bent',      sub: 'Single',          cover: 'assets/als-jij-hier-niet-bent.webp',        desc: 'De stilte die je achterlaat als je er niet bent.' },
  { id: 'jij-bent-vrij',              title: 'Jij bent vrij',               sub: 'Zevende single',  cover: 'assets/jij-bent-vrij.webp',                 desc: 'Over de moed om eindelijk jezelf te zijn.' },
];

const W = 1200, H = 630;
const outDir = 'assets/og';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function makeCoverPng(coverPath) {
  // Read cover, resize to 480x480, convert to PNG buffer
  return sharp(coverPath)
    .resize(480, 480, { fit: 'cover' })
    .png()
    .toBuffer();
}

async function generateOG(song) {
  const coverBuf = await makeCoverPng(song.cover);

  // Escape special XML characters in title and sub
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const title = esc(song.title);
  const sub = esc(song.sub);

  // Wrap long titles at ~20 chars
  const words = song.title.split(' ');
  let line1 = '', line2 = '';
  for (const w of words) {
    if ((line1 + ' ' + w).trim().length <= 18) line1 = (line1 + ' ' + w).trim();
    else line2 = (line2 + ' ' + w).trim();
  }
  const titleLine1 = esc(line1);
  const titleLine2 = esc(line2);
  const titleY = line2 ? 295 : 325;

  const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#faf6ef"/>
      <stop offset="100%" stop-color="#ede5d8"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f3bc78"/>
      <stop offset="100%" stop-color="#b8860b"/>
    </linearGradient>
    <clipPath id="coverClip">
      <rect x="648" y="75" width="480" height="480" rx="24"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Gold accent bar left -->
  <rect x="0" y="0" width="8" height="${H}" fill="url(#gold)"/>

  <!-- Top: IRIS brand -->
  <text x="72" y="90" font-family="Georgia, serif" font-size="22" fill="#b8860b" letter-spacing="8" font-weight="600">IRIS</text>
  <text x="72" y="116" font-family="Georgia, serif" font-size="13" fill="#9c8e80" letter-spacing="3">VERHALEN IN MUZIEK</text>

  <!-- Divider -->
  <rect x="72" y="138" width="120" height="1.5" fill="#b8860b" opacity="0.4"/>

  <!-- Sub label (single label) -->
  <text x="72" y="230" font-family="Arial, sans-serif" font-size="13" fill="#b8860b" letter-spacing="4" font-weight="700">${sub.toUpperCase()}</text>

  <!-- Song title line 1 -->
  <text x="72" y="${titleY}" font-family="Georgia, serif" font-size="${line2 ? 62 : 68}" fill="#1c1208" font-weight="400">${titleLine1}</text>
  <!-- Song title line 2 -->
  ${line2 ? `<text x="72" y="${titleY + 72}" font-family="Georgia, serif" font-size="62" fill="#1c1208" font-weight="400">${titleLine2}</text>` : ''}

  <!-- Bottom tag -->
  <text x="72" y="${H - 40}" font-family="Arial, sans-serif" font-size="14" fill="#9c8e80" letter-spacing="2">irisduym.be</text>

  <!-- Decorative circle behind cover -->
  <circle cx="888" cy="315" r="265" fill="#b8860b" opacity="0.07"/>
  <circle cx="888" cy="315" r="235" fill="#f3bc78" opacity="0.06"/>
</svg>`;

  // Composite: SVG background + cover image
  const svgBuf = Buffer.from(svg);

  await sharp(svgBuf)
    .composite([{
      input: coverBuf,
      top: 75,
      left: 648,
    }])
    .jpeg({ quality: 88 })
    .toFile(`${outDir}/${song.id}.jpg`);

  console.log(`Generated: ${outDir}/${song.id}.jpg`);
}

(async () => {
  for (const song of songs) {
    await generateOG(song);
  }
  console.log('All OG images done!');
})();

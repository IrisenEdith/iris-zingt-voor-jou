const fs = require('fs');
const path = require('path');

const songs = [
  { id: 'dit-ben-ik',                   title: 'Dit ben ik',                   sub: 'Eerste single',   desc: 'Mijn eerste single. Een eerlijke muzikale kennismaking met wie ik ben. Luister nu via irisduym.be.' },
  { id: 'van-alle-mensen',              title: 'Van alle mensen',              sub: 'Tweede single',   desc: 'Van alle mensen koos ik jou. Luister naar de tweede single van IRIS via irisduym.be.' },
  { id: 'als-het-jou-niet-was-geweest', title: 'Als het jou niet was geweest', sub: 'Derde single',    desc: 'Een ode aan de mensen die ons vormen. De derde single van IRIS, nu te beluisteren.' },
  { id: 'jij-bent-mijn-thuis',         title: 'Jij bent mijn thuis',         sub: 'Single',          desc: 'Thuis is niet een plek. Thuis ben jij. Beluister de nieuwe single van IRIS.' },
  { id: 'mijn-hart-kent-de-weg',       title: 'Mijn hart kent de weg',       sub: 'Single',          desc: 'Zelfs als ik de weg kwijt ben, weet mijn hart de weg. Nieuwe single van IRIS.' },
  { id: 'als-jij-hier-niet-bent',      title: 'Als jij hier niet bent',      sub: 'Single',          desc: 'De stilte die je achterlaat als je er niet bent. Beluister de single van IRIS.' },
  { id: 'jij-bent-vrij',              title: 'Jij bent vrij',               sub: 'Zevende single',  desc: 'Over de moed om eindelijk jezelf te zijn. De zevende single van IRIS, nu te beluisteren.' },
];

const baseUrl = 'https://irisduym.be';

function makePage(song) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${song.title} – IRIS | Verhalen in Muziek</title>
<meta name="description" content="${song.desc}"/>
<link rel="canonical" href="${baseUrl}/songs/${song.id}/"/>

<!-- Open Graph -->
<meta property="og:type" content="music.song"/>
<meta property="og:title" content="${song.title} – IRIS"/>
<meta property="og:description" content="${song.desc}"/>
<meta property="og:image" content="${baseUrl}/assets/og/${song.id}.jpg"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:url" content="${baseUrl}/songs/${song.id}/"/>
<meta property="og:site_name" content="IRIS – Verhalen in Muziek"/>
<meta property="og:locale" content="nl_BE"/>

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${song.title} – IRIS"/>
<meta name="twitter:description" content="${song.desc}"/>
<meta name="twitter:image" content="${baseUrl}/assets/og/${song.id}.jpg"/>

<!-- Redirect naar het nummer op de hoofdsite -->
<meta http-equiv="refresh" content="0;url=${baseUrl}/#${song.id}"/>
<script>window.location.replace('${baseUrl}/#${song.id}');</script>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:#faf6ef;color:#1c1208;font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem;}
  .card{max-width:480px;text-align:center;}
  .label{font-size:0.75rem;letter-spacing:0.25em;color:#b8860b;font-family:sans-serif;font-weight:700;text-transform:uppercase;margin-bottom:0.5rem;}
  h1{font-size:2.5rem;line-height:1.15;margin-bottom:1rem;}
  p{color:#5a4a38;line-height:1.6;margin-bottom:2rem;}
  a{display:inline-block;background:#b8860b;color:#fff8ee;padding:0.85rem 2rem;border-radius:9999px;font-family:sans-serif;font-weight:700;font-size:0.85rem;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;}
  a:hover{background:#9a7209;}
</style>
</head>
<body>
<div class="card">
  <p class="label">${song.sub} · IRIS</p>
  <h1>${song.title}</h1>
  <p>${song.desc}</p>
  <a href="${baseUrl}/#${song.id}">Beluister nu</a>
</div>
</body>
</html>`;
}

for (const song of songs) {
  const dir = path.join('songs', song.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), makePage(song), 'utf8');
  console.log(`Created: songs/${song.id}/index.html`);
}
console.log('All song pages done!');

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');
const MAX_WIDTH = 1920;
const QUALITY = 82;

const images = fs.readdirSync(assetsDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));

(async () => {
  for (const file of images) {
    const filePath = path.join(assetsDir, file);
    const stat = fs.statSync(filePath);
    const sizeMB = (stat.size / 1024 / 1024).toFixed(1);

    let meta;
    try { meta = await sharp(filePath).metadata(); } catch(e) { console.log(`⚠ ${file} — overgeslagen (ongeldig formaat)`); continue; }
    const isLarge = stat.size > 300 * 1024 || meta.width > MAX_WIDTH;

    if (!isLarge) {
      console.log(`✓ ${file} (${sizeMB}MB) — ok`);
      continue;
    }

    const ext = path.extname(file).toLowerCase();
    const tmpPath = filePath + '.tmp';

    let pipeline = sharp(filePath).resize({ width: MAX_WIDTH, withoutEnlargement: true });

    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: QUALITY, progressive: true });
    } else {
      pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9 });
    }

    await pipeline.toFile(tmpPath);
    const newSize = (fs.statSync(tmpPath).size / 1024 / 1024).toFixed(1);
    fs.renameSync(tmpPath, filePath);
    console.log(`✅ ${file}: ${sizeMB}MB → ${newSize}MB`);
  }
  console.log('\nKlaar!');
})();
